<template lang="pug">
.container.m-0.p-0(v-show="show")
    .row.mt-3
      .col-12
        button.btn.btn-primary.btn-rounded.text-uppercase.d-inline-flex.justify-content-center(
          type="button"
          v-if="open && selectedNormalMode && !isRevalidation"
          @click="setMode('daily')"
        )
          div
            i.text-white.lnr.lnr-calendar-full
          .ml-2.text-white trocar para múltiplas diárias
        button.btn.btn-primary.btn-rounded.text-uppercase.d-inline-flex.justify-content-center(
          type="button"
          v-else-if="open && !isRevalidation"
          @click="setMode('normal')"
        )
          div
            i.text-white.lnr.lnr-clock
          .ml-2.text-white trocar para períodos
    selecter.my-4(
      v-if="open && selectedNormalMode"
      :initialValue="1"
      :label="selecterLabel"
      :boundaries="selecterBoundaries"
      @change="setPeriod"
    )
    dailies(
      v-else
      :initial-period="initialPeriod"
      @period-selected="setPeriodInterval"
    )
    .row.mb-2
      .col-12
        .d-flex.flex-column.align-items-center
          div.justify-content-center.align-items-center
            .small.text-center.text-secondary.mb-1 valor a pagar =
            .badge.badge-pill.badge-danger.pt-2.pb-1.px-4.d-inline-flex(
              :class="{ 'badge-danger': charge > 0, disabled: !charge }"
            )
              .mt-2.mr-2.text-white R$
              h4.text-white {{ charge | money }}
          .small.text-secondary.mt-1(v-if="isRevalidation") referente a {{ period | pluralize('período extra', 'períodos extras', true) }}
          .small.text-secondary.mt-1(v-else) referente a {{ period | pluralize('período', 'períodos', true) }}
          .badge.badge-pill.badge-success.px-4.pb-2.d-inline-flex(v-if="discount")
            .small.text-center.text-white.mt-1 {{ discountLabel }} {{ discount | money }}
    .row.m-2.pt-2(v-if="to.isValid")
      .col-12.d-inline-flex.justify-content-between
        h5.font-weight-bold Validade
        h5.font-weight-bold {{ to.toString() | periodToBR }}
</template>

<script>
import Selecter from '@/components/commons/Selecter'
import Dailies from '@/components/commons/Dailies'
import {
  DATE,
  DATE_TIME_WITHOUT_SECONDS,
  PARKING_LOT_CODE,
  PARKING_MODE_DAILY,
  PARKING_MODE_NORMAL
} from '@/utils/constants'
import commons from '@/utils/mixins/commons'
import payment from '@/utils/mixins/payment'
import period from '@/utils/mixins/period'
import storeParking from '@/utils/mixins/storeParking'
import storeUser from '@/utils/mixins/storeUser'
import { inRange, min } from 'lodash'
import { DateTime } from 'luxon'

export default {
  name: 'SelectPeriod',
  mixins: [commons, storeUser, storeParking, payment, period],
  components: {
    Dailies,
    Selecter
  },
  props: {
    params: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      emitting: false,
      mode: PARKING_MODE_NORMAL,
      licencePlate: '',
      vehicle: {},
      from: DateTime.local(),
      to: '',
      originalTo: '',
      intervalValid: false,
      initialPeriod: {},
      periodByDay: [],
      sending: false,
      selecterLabel: {
        singular: 'período',
        plural: 'períodos',
        showValue: true
      },
      selecterBoundaries: {
        lower: 1,
        upper: 1
      },
      show: false
    }
  },
  computed: {
    inRevalidationPeriod () {
      if (!this.isRevalidation) return false
      const startDiff = this.now.diff(this.from, 'minutes').minutes
      const endDiff = this.originalTo.diff(this.now, 'minutes').minutes
      return inRange(startDiff, 0, 6) || inRange(endDiff, 0, 6)
    },
    isRevalidation () {
      return this.params?.revalidation || false
    },
    periodIntervalInDays () {
      if (!this.from || !this.to) return 0
      return Math.ceil(this.to.diff(this.from, 'days').days) + 1
    },
    fullCharge () {
      return this.period * this.chargeByPeriod
    },
    charge () {
      if (this.vehicle.discount) {
        let charge = this.fullCharge
        if (this.vehicle.applyFirstHourDiscount) {
          charge = charge - this.chargeByPeriod
        }
        charge = parseFloat(charge / 2).toFixed(2)
        if (charge > 0) return charge
        return 0
      }
      return this.fullCharge
    },
    discount () {
      return this.fullCharge - this.charge
    },
    discountLabel () {
      if (this.vehicle.discount) return 'desconto de residente aplicado - R$ '
      return ''
    },
    upper () {
      return this.maxPeriodThatCanBeBought
    },
    selectedNormalMode () {
      return this.mode === PARKING_MODE_NORMAL
    },
    selectedDailyMode () {
      return this.mode === PARKING_MODE_DAILY
    },
    open () {
      const now = this.now.toMillis()
      const startInMillis = this.openingAt.toMillis()
      const endInMillis = this.closingAt.toMillis()
      return inRange(now, startInMillis, endInMillis + 1)
    },
    closingAt () {
      return DateTime.fromISO(this.parking.workingHours.end)
    },
    openingAt () {
      return DateTime.fromISO(this.parking.workingHours.start)
    },
    btnDisabled () {
      if (!this.userHasSufficientFunds) return true
      return !this.licencePlate || !this.period || this.sending
    }
  },
  async created () {
    this.$parent.$on('reset', () => {
      this.show = false
      this.resetData()
      this.setMode('normal')
      this.licencePlate = ''
      this.vehicle = {}
    })
    this.$parent.$on('parking-plate', async (plate) => {
      const { data } = await this.$api.fetchVehicleByLicencePlate(plate)
      this.$emit('period-reset', true)
      this.licencePlate = plate
      this.vehicle = data
      if (this.vehicle.parkingFree) {
        this.show = false
        this.$emit('parking-free')
        return
      }
      this.show = true
      this.$emit('show-items', true)
    })
    this.parkingLot = PARKING_LOT_CODE
    await this.fetchChargeByPeriod()
  },
  watch: {
    vehicle (value) {
      this.$emit('vehicle', this.vehicle)
    },
    charge (value) {
      this.$emit('amount-changed', value)
    },
    period () {
      this.handlePeriodChange()
    },
    periodDuration () {
      this.handlePeriodChange()
    },
    to (value) {
      this.$emit('to-changed', value)
    },
    from (value) {
      this.$emit('from-changed', value)
      if (!value || !this.intervalValid || this.isRevalidation) return
      const startAt = DateTime.fromISO(this.parking.workingHours.start)
      if (value.hour < startAt.hour) {
        this.from = DateTime.fromFormat(value.toFormat(DATE), DATE).plus({ hours: startAt.hour })
      }
    },
    intervalValid (value) {
      if (!value) this.period = 0
    },
    now (value) {
      if (!this.from.isValid || !this.to.isValid) return
      const timeWithoutSeconds = DateTime.fromFormat(value.toFormat(DATE_TIME_WITHOUT_SECONDS), DATE_TIME_WITHOUT_SECONDS)
      const fromWithoutSeconds = DateTime.fromFormat(this.from.toFormat(DATE_TIME_WITHOUT_SECONDS), DATE_TIME_WITHOUT_SECONDS)
      if (timeWithoutSeconds.diff(fromWithoutSeconds, 'seconds').seconds < 60) return
      if (!this.isRevalidation) this.from = timeWithoutSeconds
      if (this.isRevalidation) {
        if (!this.inRevalidationPeriod) {
          if (this.emitting) return
          this.emitting = true
          this.$emit('ticket-revalidation')
          return
        }
        if (this.originalTo < value) {
          if (this.emitting) return
          this.emitting = true
          this.$emit('ticket-expired')
          return
        }
      }
      if (this.to.diff(this.from, 'hours').hours < 1) this.to = this.from.plus({ hours: 1 })
      this.$root.$emit('date-selected', 'from', value)
      this.$root.$emit('date-selected', 'to', this.to)
    },
    mode () {
      if (this.isRevalidation) return
      this.resetData()
    },
    upper (value) {
      this.selecterBoundaries.upper = value
    },
    params: {
      deep: true,
      handler: function () {
        this.remount()
      }
    }
  },
  methods: {
    calculatePeriodFromInterval () {
      if (!this.intervalValid) return
      let start = this.from
      let startsAt = DateTime.fromISO(this.parking.workingHours.start)
      let endsAt = DateTime.fromISO(this.parking.workingHours.end)
      const diffDays = Math.trunc(DateTime.fromISO(start.toFormat(DATE)).diff(DateTime.fromISO(startsAt.toFormat(DATE)), 'days').days)
      startsAt = startsAt.plus({ days: diffDays })
      endsAt = endsAt.plus({ days: diffDays })
      this.periodByDay = []
      for (let i = 0; i < this.periodIntervalInDays; i++) {
        const increment = +(i > 0)
        start = start.plus({ days: increment })
        if (start > this.to) {
          start = start.minus({ days: increment })
          break
        }
        endsAt = endsAt.plus({ days: increment })
        const end = min([endsAt, this.to])
        if (start > this.from || start.hour < startsAt.hour) start = DateTime.fromISO(start.toFormat(DATE)).plus({ hours: startsAt.hour })
        const period = end.diff(start, 'seconds') / 1000
        if (period <= 0) continue
        this.periodByDay.push(Math.ceil(period / this.periodDuration))
      }
      if (this.periodByDay[this.periodByDay.length - 1] && this.to.diff(start, 'days').days > 0) {
        const seconds = this.periodByDay[this.periodByDay.length - 1] * this.periodDuration
        this.to = start.plus({ seconds })
        if (this.to > endsAt) this.to = endsAt
        this.$root.$emit('date-selected', 'to', this.to, false)
      }
      this.period = this.periodByDay.length > 0 ? this.periodByDay.reduce((period, total) => total + period) : 0
      if (this.period > 0 && this.isRevalidation) this.period -= this.params.ticket.ocu_n_periodos
    },
    handlePeriodChange () {
      this.$emit('period-changed', this.period)
      if (this.mode === PARKING_MODE_DAILY) return
      this.to = this.from.plus({ seconds: (this.period + (this.params?.ticket.ocu_n_periodos || 0)) * this.periodDuration })
      const startAt = DateTime.fromISO(this.parking.workingHours.start)
      const endAt = DateTime.fromISO(this.parking.workingHours.end)
      if (!inRange(this.to.hour, startAt.hour, endAt.hour + 24)) this.to = endAt
    },
    setPeriodInterval (valid, from, to) {
      this.intervalValid = valid
      this.from = valid ? DateTime.fromFormat(from, DATE_TIME_WITHOUT_SECONDS) : ''
      this.to = valid ? DateTime.fromFormat(to, DATE_TIME_WITHOUT_SECONDS) : ''
      if (valid) this.calculatePeriodFromInterval()
    },
    setPeriod (value) {
      this.period = value
    },
    setMode (value) {
      this.mode = value
    },
    remount () {
      if (!this.open) this.mode = PARKING_MODE_DAILY
      if (this.isRevalidation) {
        this.$root.$emit('set-title', 'revalidação de ticket avulso')
        this.mode = this.params.mode
        this.licencePlate = this.params.ticket.vehicle.placa
        this.vehicle = this.params.ticket.vehicle
        this.from = DateTime.fromISO(this.params.ticket.dt_hr_entrada)
        this.to = DateTime.fromISO(this.params.ticket.dt_hr_saida).plus({ hours: 1 }) // this.from.plus({ seconds: (+this.params.ticket.ocu_n_periodos + 1) * this.periodDuration })
        if (this.to >= this.closingAt && this.mode === PARKING_MODE_NORMAL) {
          if (this.emitting) return
          this.emitting = true
          this.$emit('ticket-has-max-validity')
          return
        }
        this.originalTo = DateTime.fromISO(this.params.ticket.dt_hr_saida)
        if (this.mode === PARKING_MODE_DAILY) {
          const initialPeriod = {
            from: this.from.toFormat(DATE_TIME_WITHOUT_SECONDS),
            to: this.to.toFormat(DATE_TIME_WITHOUT_SECONDS),
            limit: this.to
          }
          Object.assign(this.initialPeriod, initialPeriod)
          this.intervalValid = true
          this.calculatePeriodFromInterval()
        }
      }
      this.$root.$emit('toggle-clock', true)
    },
    resetData () {
      this.$root.$emit('reset-title')
      this.setPeriod(+(this.mode === PARKING_MODE_NORMAL))
      this.from = DateTime.local()
      this.to = ''
      this.originalTo = ''
      this.intervalValid = false
      this.periodByDay = []
      this.$root.$emit('calendar-min-date', DateTime.local())
      this.handlePeriodChange()
    }
  }
}
</script>
