<template>
  <div class="container free-bottom">
    <div class="row">
      <div class="col-12">
        <form>
          <div class="form-group buscar-placa">
            <div class="form-input">
              <custom-input
                type="search"
                :value="licencePlate"
                :validation="licencePlateValidation"
                @change="(value) => setLicencePlate(value).then(() => {})"
                placeholder="Informe a placa do veículo"
                :className="'input-buscar-placa'"
              ></custom-input>
            </div>
          </div>
          <div class="form-group" style="margin-top: 4rem">
            <button
              class="btn btn-rounded text-uppercase"
              :class="[
                placaPreenchida == true
                  ? 'btn-primary'
                  : 'btn-outline-secondary',
              ]"
              type="button"
              :disabled="!placaPreenchida"
              @click="ConsultarPlaca"
            >
              Buscar Veículo
              <i class="fas fa-search"></i>
            </button>
          </div>
          <div class="form-group">
            <select-period
              v-show="showItems"
              :params="selectPeriodParams"
              @vehicle="setVehicle"
              @from-changed="setFrom"
              @to-changed="setTo"
              @period-changed="setPeriod"
              @amount-changed="setAmount"
              @ticket-expired="cantRevalidateTicketExpired"
              @ticket-revalidation="cantRevalidateTicketOutOfRevalidationPeriod"
              @ticket-has-max-validity="cantRevalidateTicketHasMaxValidity"
              @parking-free="vehicleHasFreeParking"
              @show-items="setShowItems"
            ></select-period>
          </div>
          <div class="form-group">
            <payment
              v-show="showItems"
              :btnDisabled="btnDisabled"
              :amount="+amount"
              :period="period"
              :vehicle="vehicle"
              @payment-response="paymentResponse"
              @payment-error="paymentError"
            ></payment>
          </div>
          <div ref="porto" class="fl-porto"></div>
        </form>
      </div>
    </div>
    <datetime
      type="datetime"
      ref="dateTimePicker"
      v-model="selectedDate"
      input-class="calendar-input"
      :min-datetime="minDate"
      :week-start="7"
      value-zone="America/Sao_Paulo"
      zone="America/Sao_Paulo"
      :phrases="{ ok: 'Selecionar', cancel: 'Cancelar' }"
      @close="onSelectedDate"
    ></datetime>
  </div>
</template>

<script>
import CustomInput from '@/components/commons/Input'
import SelectPeriod from '@/components/parking/SelectPeriod'
import Payment from '@/components/commons/Payment'
import { PARKING_LOT_CODE } from '@/utils/constants'
import { APP_MESSAGES } from '@/utils/constants/messages'
import payment from '@/utils/mixins/payment'
import storeIrregularities from '@/utils/mixins/storeIrregularities'
import { Datetime } from 'vue-datetime'
import { DateTime } from 'luxon'
import commons from '@/utils/mixins/commons'
import { required, minLength, maxLength } from 'vuelidate/lib/validators'

export default {
  name: 'BuyParkingTime',
  mixins: [commons, payment, storeIrregularities],
  components: {
    Payment,
    Datetime,
    SelectPeriod,
    CustomInput
  },
  data () {
    return {
      showItems: false,
      selectedDate: '',
      minDate: DateTime.local().toISO(),
      fetching: false,
      licencePlate: '',
      vehicle: {},
      parkingLot: 0,
      from: '',
      to: '',
      period: 0,
      amount: 0,
      ticketsInRevalidationPeriod: [],
      ticketsNotInRevalidationPeriod: [],
      placaPreenchida: false,
      placa: ''
    }
  },
  validations: {
    licencePlate: {
      required,
      minLength: minLength(7),
      maxLength: maxLength(7),
      licencePlateFormat: (value) =>
        /^[A-Z]{3}\d(\d|[A-Z])+[\d]{2}$/.test(value),
      blackListValues: (value) =>
        !/((^|\s)((teste|test)(s)?)(\s|$))/i.test(value)
    }
  },
  computed: {
    selectPeriodParams () {
      const params = {
        ticket: {},
        revalidation: false,
        mode: this.mode
      }
      if (this.hasTicketInRevalidationPeriod) {
        const paramsWithTicket = {
          ticket: this.ticket,
          revalidation: true,
          mode: this.mode
        }
        Object.assign(params, paramsWithTicket)
      }
      return params
    },
    mode () {
      if (!this.ticket.dt_hr_entrada) return 'normal'
      const startPeriod = DateTime.fromISO(this.ticket.dt_hr_entrada)
      const endPeriod = DateTime.fromISO(this.ticket.dt_hr_saida)
      return Math.trunc(endPeriod.diff(startPeriod, 'days').days) > 0
        ? 'daily'
        : 'normal'
    },
    ticket () {
      if (!this.hasTicketInRevalidationPeriod) return {}
      return this.ticketsInRevalidationPeriod[0]
    },
    hasActiveTicket () {
      return this.ticketsNotInRevalidationPeriod.length > 0
    },
    hasTicketInRevalidationPeriod () {
      return this.ticketsInRevalidationPeriod.length > 0
    },
    licencePlateValidation () {
      const validations = [
        {
          type: 'error',
          msg: 'Informe a placa do veículo. Ex.: ABC1S34',
          valid: false
        }
      ]
      if (!this.$v.licencePlate.$invalid && this.licencePlate) {
        return { type: 'success', valid: true }
      }
      if (this.$v.licencePlate.$invalid && this.$v.licencePlate.$dirty) {
        return validations[0]
      }
      return {}
    },
    dateTimePicker () {
      return this.$refs.dateTimePicker
    },
    btnDisabled () {
      return this.$v.$invalid || !this.period || !this.amount
    }
  },
  created () {
    this.$root.$on('calendar-min-date', (minDate) => {
      this.minDate = minDate.toISO()
    })
    this.$root.$on('open-calendar', (selectedDate) => {
      if (!this.dateTimePicker) return
      this.selectedDate = selectedDate.toISO()
      this.dateTimePicker.isOpen = true
    })
    this.parkingLot = PARKING_LOT_CODE
    this.setInitialValues()
  },
  mounted () {
    this.licencePlateFocus()
  },
  watch: {
    licencePlate () {
      this.licencePlateFocus()
    }
  },
  methods: {
    async paymentResponse (data) {
      try {
        const { paymentId, authorizationCode } = data
        const amountAsDouble = +data.amount / 100
        const sendData = {
          payment: {
            checkNumber: paymentId,
            amount: amountAsDouble
          },
          paymentLog: {
            payment_id: paymentId,
            transaction_id: authorizationCode,
            value: amountAsDouble
          },
          parking: {
            id: this.ticket?.id_ocupacao,
            parkLot: this.parkingLot,
            period: this.period,
            plate: this.licencePlate,
            periodStart: this.from.isValid ? this.from.toISO() : '',
            periodEnd:
              this.from.isValid &&
              this.to.isValid &&
              Math.trunc(this.to.diff(this.from, 'days')) > 0
                ? this.to.toISO()
                : '',
            isRevalidation: this.hasTicketInRevalidationPeriod
          }
        }
        const result = await this.processPayment(sendData)
        if (result.status !== 200) throw result
        const { ticket } = result.data
        this.$router
          .push({ name: 'Payment OK', params: { id: ticket } })
          .catch(() => {})
      } catch (err) {
        console.debug(err)
        // if (data.paymentId) await this.processRefund(data);
      } finally {
        this.$emit('toggle-sending', false)
        this.toggleShowLoading(false)
      }
    },
    paymentError () {
      this.setLicencePlate('').then(() => {})
      this.toggleShowLoading(false)
      this.$emit('toggle-sending', false)
    },
    onSelectedDate () {
      this.$root.$emit('date-selected', '', this.selectedDate, true)
    },
    setVehicle (value) {
      this.vehicle = value
    },
    setAmount (value) {
      this.amount = value
    },
    setPeriod (value) {
      this.period = value
    },
    setTo (value) {
      this.to = value
    },
    setFrom (value) {
      this.from = value
    },
    setShowItems (value) {
      this.showItems = value
      if (value) {
        this.scrollToClass('.fl-porto').then(() => {})
      }
    },
    async fetchTickets () {
      try {
        const { data } = await this.$api.fetchParkingByLicencePlate(
          this.licencePlate
        )
        this.ticketsInRevalidationPeriod = [
          ...data.ticketsInRevalidationPeriod
        ]
        this.ticketsNotInRevalidationPeriod = [
          ...data.ticketsNotInRevalidationPeriod
        ]
      } catch (err) {
        console.debug(err)
      }
    },
    async fetchIrregularities () {
      try {
        const { data } = await this.$api.fetchIrregularities(this.licencePlate)
        this.irregularitiesSetItems(data)
      } catch (err) {
        console.debug(err)
      }
    },
    cantRevalidateTicketHasMaxValidity () {
      this.showAlert(
        'Este ticket não pode ser revalidado',
        APP_MESSAGES.ticketHasMaxValidity
      )
      this.setLicencePlate('').then(() => {})
      this.toggleShowLoading(false)
    },
    cantRevalidateTicketOutOfRevalidationPeriod () {
      this.showAlert(
        'Este ticket não pode ser revalidado',
        APP_MESSAGES.ticketOutOfRevalidationPeriod
      )
      this.setLicencePlate('').then(() => {})
      this.toggleShowLoading(false)
    },
    cantRevalidateTicketExpired () {
      this.showAlert(
        'Este ticket não pode ser revalidado',
        APP_MESSAGES.ticketExpired
      )
      this.setLicencePlate('').then(() => {})
      this.toggleShowLoading(false)
    },
    cantCreateTicket () {
      this.showAlert(
        'Existe um ticket ativo para este veículo',
        APP_MESSAGES.ticketActive
      )
      this.setLicencePlate('').then(() => {})
      this.fetching = false
    },
    vehicleHasFreeParking () {
      this.showAlert('Veículo isento', APP_MESSAGES.parkingFree)
      this.setLicencePlate('').then(() => {})
    },
    async setLicencePlate (value) {
      this.placa = value
      this.setShowItems(false)
      await this.irregularitiesSetItems([])
      this.$emit('reset')
      this.licencePlate = value
        .toString()
        .replace(/[^\dA-Za-z]/g, '')
        .toUpperCase()
      this.$v.licencePlate.$touch()
      if (this.$v.licencePlate.$invalid) {
        this.placaPreenchida = false
        return this.$root.$emit('toggle-clock', false)
      }
      this.placaPreenchida = true
    },
    licencePlateFocus (value) {
      const el = document.getElementsByTagName('input')[0]
      if (!this.$v.licencePlate.$invalid) return el.blur()
      setTimeout(function () {
        el.focus()
      }, 40)
    },
    async ConsultarPlaca () {
      if (this.fetching) {
        return
      }
      this.fetching = true
      this.toggleShowLoading(true)
      await this.fetchIrregularities()
      if (this.hasSameDayIrregularity) {
        return this.$router
          .push({
            name: 'Irregularity',
            params: { id: this.sameDayIrregularity.irr_codigo }
          })
          .catch(() => {})
      }
      if (this.hasIrregularities) {
        this.showAlert(
          'Irregularidade existente',
          APP_MESSAGES.hasIrregularities
        )
      }
      await this.fetchTickets()
      this.toggleShowLoading(false)
      if (this.hasActiveTicket) return this.cantCreateTicket()
      this.$emit('parking-plate', this.placa)
      this.fetching = false
    },
    async scrollToClass (classe) {
      var element = this.$el.querySelector(classe)
      setTimeout(function () {
        var top = element.offsetTop
        window.scrollTo(0, top)
      }, 1000)
    }
  }
}
</script>

<style scoped>
label {
  font-size: 10rem;
}
input {
  font-size: 10rem;
}
</style>
