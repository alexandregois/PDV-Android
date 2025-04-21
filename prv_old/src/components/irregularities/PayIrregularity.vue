<template >
  <div class="container">
    <div class="row mb-3">
      <div
        class="col-12 pt-3 d-inline-flex align-items-baseline"
        @click="redirectTo('Buy Parking Time')"
      >
        <div><i class="small fas fa-chevron-left"></i></div>
        <div class="ml-2">
          <h6>voltar</h6>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-12 d-inline-flex justify-content-between">
        <div>Placa</div>
        <div>{{ licencePlate }}</div>
      </div>
    </div>
    <div class="row mt-2">
      <div class="col-12 d-inline-flex justify-content-between">
        <div>Data/hora do relato</div>
        <div>{{ irregularity.irr_dt_hora | periodToBR }}</div>
      </div>
    </div>
    <div class="row my-2">
      <div class="col-12 d-inline-flex justify-content-between">
        <h6>Referência</h6>
        <h6>{{ irregularity.referenceDate | periodToBR }}</h6>
      </div>
    </div>
    <div class="row mb-2">
      <div class="col-12 d-inline-flex justify-content-between">
        <h6>Permanência</h6>
        <h6>
          {{ irregularity.period | pluralize("período", "períodos", true) }}
        </h6>
      </div>
    </div>
    <div class="row mt-2" v-if="irregularity.isSameDay">
      <div class="col-12 d-inline-flex justify-content-between">
        <h6 class="font-weight-bold text-red">Valor devido</h6>
        <h6 class="font-weight-bold text-red">
          R$ {{ irregularity.amountDue | money }}
        </h6>
      </div>
    </div>
    <div class="row my-3 border-top pt-2" v-if="irregularity.isSameDay">
      <div class="col-12">
        <h5>Quer continuar estacionado? Adquira períodos adicionais.</h5>
      </div>
    </div>
    <selecter
      v-if="irregularity.isSameDay"
      :initialValue="0"
      :label="selecterLabel"
      :boundaries="selecterBoundaries"
      @change="setPeriod"
    ></selecter>
    <div class="row my-2" v-if="irregularity.isSameDay">
      <div class="col-12 d-inline-flex justify-content-between">
        <h6 class="font-weight-bold" :class="{ 'text-black-50': !period }">
          Valor adicional
        </h6>
        <h6 class="font-weight-bold" :class="{ 'text-black-50': !period }">
          R$ {{ additionalCharge | money }}
        </h6>
      </div>
    </div>
    <div class="row my-2 border-top pt-2">
      <div class="col-12 d-inline-flex justify-content-between">
        <h5 class="font-weight-bold">Total</h5>
        <h5 class="font-weight-bold">
          {{ totalPeriod | pluralize("período", "períodos", true) }}
        </h5>
      </div>
    </div>
    <div class="row my-2" v-if="irregularity.isSameDay">
      <div class="col-12 d-inline-flex justify-content-between">
        <h5 class="font-weight-bold">Validade</h5>
        <h5 class="font-weight-bold">
          {{ validUntil.toString() | periodToBR }}
        </h5>
      </div>
    </div>
    <div class="row my-2 breadcrumb">
      <div
        class="
          col-12
          d-flex
          flex-column
          justify-content-center
          align-items-center
        "
      >
        <div class="small text-black-50">{{ chargeLabel }}</div>
        <div class="font-weight-bold text-red">
          <h3 class="font-weight-bold">R$ {{ charge | money }}</h3>
        </div>
      </div>
      <div class="col-12 d-inline-flex justify-content-center" v-if="discount">
        <div class="badge badge-pill badge-success px-4 pb-2 d-inline-flex">
          <div class="small text-center text-white mt-1">
            {{ discountLabel }} {{ discount | money }}
          </div>
        </div>
      </div>
    </div>
    <payment
      class="my-3"
      :amount="+charge"
      :period="totalPeriod"
      :btnDisabled="btnDisabled"
      :vehicle="vehicle"
      @payment-response="paymentResponse"
      @payment-error="paymentError"
    ></payment>
    <div ref="porto" class="fl-porto"></div>
  </div>
</template>

<script>
import Payment from '@/components/commons/Payment'
import Selecter from '@/components/commons/Selecter'
import { APP_MESSAGES } from '@/utils/constants/messages'
import {
  IRREGULARITY_CLOSED_STATUS,
  PARKING_LOT_CODE
} from '@/utils/constants'
import storeIrregularities from '@/utils/mixins/storeIrregularities'
import storeParking from '@/utils/mixins/storeParking'
import { min } from 'lodash'
import { DateTime } from 'luxon'
import commons from '@/utils/mixins/commons'
import payment from '@/utils/mixins/payment'
import period from '@/utils/mixins/period'
import storeUser from '@/utils/mixins/storeUser'

export default {
  name: 'PayIrregularity',
  mixins: [
    commons,
    storeUser,
    storeParking,
    storeIrregularities,
    payment,
    period
  ],
  components: {
    Payment,
    Selecter
  },
  props: {
    params: Object
  },
  data () {
    return {
      listenerId: '',
      vehicle: {},
      irregularity: {},
      originalValidity: '',
      selecterLabel: {
        singular: 'período',
        plural: 'períodos',
        showValue: true
      },
      selecterBoundaries: {
        lower: 0,
        upper: 0
      }
    }
  },
  computed: {
    validUntil () {
      const startTime = DateTime.fromISO(this.irregularity.irr_dt_hora)
      const validity = startTime.plus({
        seconds: this.totalPeriod * this.periodDuration
      })
      const end = DateTime.fromISO(this.parking.workingHours.end)
      if (!this.totalPeriod || !this.periodDuration || !end) return ''
      return min([validity, end])
    },
    periodToBuy () {
      const period =
        this.totalPeriod - this.maxPeriodUserCanBuyWithActualBalance
      return period > 0 ? period : 0
    },
    totalPeriod () {
      return this.period + this.irregularity.period
    },
    upper () {
      // const maxPeriod = this.maxPeriodUserCanBuyWithActualBalance - this.irregularity.period
      // return min([maxPeriod > -1 ? maxPeriod : 0, this.maxPeriodThatCanBeBought])
      return this.maxPeriodThatCanBeBought
    },
    maxPeriodUserCanBuyWithActualBalance () {
      const chargeByPeriod = this.vehicle.discount
        ? parseFloat(this.chargeByPeriod / 2).toFixed(2)
        : this.chargeByPeriod
      return Math.trunc(this.userBalance / chargeByPeriod)
    },
    userHasSufficientFunds () {
      return this.userBalance >= this.charge
    },
    chargeLabel () {
      const label = 'valor devido'
      if (this.irregularity.isSameDay) {
        return `${label} + períodos adicionais =`
      }
      return `${label} =`
    },
    charge () {
      return +this.irregularity.amountDue + +this.additionalCharge
    },
    fullAdditionalCharge () {
      return +this.period * +this.chargeByPeriod
    },
    additionalCharge () {
      if (this.vehicle.discount) {
        let charge = this.fullAdditionalCharge
        charge = parseFloat(charge / 2).toFixed(2)
        if (charge > 0) return charge
        return 0
      }
      return this.fullAdditionalCharge
    },
    discount () {
      return (
        +this.irregularity.discount +
        +this.fullAdditionalCharge -
        +this.additionalCharge
      )
    },
    discountLabel () {
      if (!this.vehicle.discount) return ''
      return 'desconto de residente aplicado - R$ '
    },
    licencePlate () {
      return this.irregularity.irr_placa
    },
    paymentInfoNeededAndFilled () {
      if (!this.periodToBuy) return true
      return this.paymentInfoFilled
    },
    btnDisabled () {
      return !this.licencePlate || !this.charge
    }
  },
  created () {
    this.irregularity = this.params?.params || this.sameDayIrregularity
    this.toggleShowLoading(true)
    this.parkingLot = PARKING_LOT_CODE
    this.startClock()
    this.fetchChargeByPeriod()
    this.fetchIrregularity()
    this.showAlert(
      'Existe uma irregularidade para este veículo',
      APP_MESSAGES.irregularityFound,
      'REGULARIZAR'
    )
  },
  beforeDestroy () {
    if (!this.listenerId) return
    clearInterval(this.listenerId)
  },
  watch: {
    now: {
      immediate: false,
      handler: function () {
        if (this.irregularity.isSameDay) this.verifyValidity()
      }
    },
    validUntil (value) {
      if (this.originalValidity.isValid) return
      this.originalValidity = value
    },
    upper: {
      immediate: true,
      handler: function (value) {
        this.selecterBoundaries.upper = value
      }
    }
  },
  methods: {
    async paymentResponse (data) {
      try {
        const { paymentId, authorizationCode } = data
        const amountAsDouble = +data.amount / 100
        const sendData = {
          parking: {
            parkLot: this.parkingLot,
            period: this.totalPeriod,
            plate: this.licencePlate,
            periodStart: this.irregularity.irr_dt_hora,
            periodEnd: this.validUntil.toISO()
          },
          irregularity: {
            id: this.irregularity.irr_codigo,
            data: {
              irr_status: IRREGULARITY_CLOSED_STATUS
            }
          }
        }
        Object.assign(sendData, {
          payment: {
            checkNumber: paymentId,
            amount: amountAsDouble
          },
          paymentLog: {
            payment_id: paymentId,
            transaction_id: authorizationCode,
            value: amountAsDouble
          }
        })
        Object.assign(sendData.irregularity, {
          payment: {
            id_op: this.user.id,
            n_p: this.totalPeriod
          }
        })

        const result = await this.processPayment(sendData)
        if (result.status !== 200) throw result
        const { ticket } = result.data
        this.$router
          .push({ name: 'Payment OK', params: { id: ticket } })
          .catch(() => {})
      } catch (err) {
        console.debug(err)
        // await this.processRefund(data);
      } finally {
        this.$emit('toggle-sending', false)
        this.toggleShowLoading(false)
      }
    },
    async fetchIrregularity () {
      this.sending = true
      try {
        const response = await this.$api.fetchIrregularity(
          this.irregularity.irr_codigo
        )
        if (response.status !== 200) throw response
        this.irregularity = response.data
        this.vehicle = this.irregularity.vehicle
        this.scrollToClass('.fl-porto').them(() => {})
      } catch (err) {
        console.debug(err)
        this.$root.$emit(
          'show-alert',
          'warning',
          err.response.statusText || 'Ocorreu um erro'
        )
      } finally {
        this.sending = false
        this.toggleShowLoading(false)
      }
    },
    setPeriod (value) {
      this.period = value
    },
    verifyValidity () {
      if (!this.validUntil) return
      const pastDue = this.validUntil.diff(this.now, 'seconds') < 1
      if (pastDue) this.fetchIrregularity()
    },
    async scrollToClass (classe) {
      var element = this.$el.querySelector(classe)
      var top = element.offsetTop
      window.scrollTo(0, top)
    },
    paymentError () {
      this.setLicencePlate().then(() => {})
      this.toggleShowLoading(false)
      this.$emit('toggle-sending', false)
    },
    async setLicencePlate () {
      await this.irregularitiesSetItems([])
      this.$emit('reset')
    }
  }
}
</script>
