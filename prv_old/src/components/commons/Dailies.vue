<template lang="pug">
  .container
    .row
      .col-12
        form
          .form-group
            .form-input
              custom-input(
                type="search"
                :value="from"
                @focus="setDateSelecterFor('from')"
                placeholder="Data/hora de início"
                icon="lnr lnr-clock"
                :readonly="preventFromTyping"
              )
            .form-input
              custom-input(
                type="search"
                :value="to"
                @focus="setDateSelecterFor('to')"
                placeholder="Data/hora de término"
                icon="lnr lnr-clock"
                :readonly="preventToTyping"
              )
</template>

<script>
import CustomInput from '@/components/commons/Input'
import { DATE_TIME_WITHOUT_SECONDS } from '@/utils/constants'
import { DateTime } from 'luxon'

export default {
  name: 'Dailies',
  components: {
    CustomInput
  },
  props: {
    initialPeriod: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      from: '',
      to: '',
      dateSelecterFor: '',
      selectedDate: '',
      lockFrom: false
    }
  },
  computed: {
    isValidPeriod () {
      const from = DateTime.fromFormat(this.from, DATE_TIME_WITHOUT_SECONDS)
      const to = DateTime.fromFormat(this.to, DATE_TIME_WITHOUT_SECONDS)
      return from.isValid && to.isValid
    },
    preventToTyping () {
      return this.dateSelecterFor === 'to' && !this.to
    },
    preventFromTyping () {
      return (this.dateSelecterFor === 'from' && !this.from) || this.lockFrom
    }
  },
  created () {
    this.$root.$on('date-selected', (selectedFor, selectedDate, propagate) => {
      if (selectedFor) this.dateSelecterFor = selectedFor
      this.selectedDate = selectedDate
      this.onSelectedDate(propagate)
    })
    if (this.initialPeriod.from) {
      this.from = this.initialPeriod.from
      this.to = this.initialPeriod.to
      this.lockFrom = true
      this.$root.$emit('calendar-min-date', this.initialPeriod.limit)
    }
  },
  watch: {
    from (value) {
      if (!value || this.initialPeriod.from) return
      const from = DateTime.fromFormat(value, DATE_TIME_WITHOUT_SECONDS)
      const minDate = from.plus({ hours: 1 })
      this.$root.$emit('calendar-min-date', minDate)
      const to = DateTime.fromFormat(this.to, DATE_TIME_WITHOUT_SECONDS)
      if (!to.isValid) return
      if (to.diff(from, 'hours') < 1) this.to = minDate.toFormat(DATE_TIME_WITHOUT_SECONDS)
    },
    to (value) {
      if (!value) return
      const from = DateTime.fromFormat(this.from, DATE_TIME_WITHOUT_SECONDS)
      if (!from.isValid) return
      const to = DateTime.fromFormat(value, DATE_TIME_WITHOUT_SECONDS)
      if (to.diff(from, 'minutes') < 1) this.from = ''
    }
  },
  methods: {
    onSelectedDate (propagate) {
      if (!this.selectedDate || !this.dateSelecterFor) return
      this[this.dateSelecterFor] = DateTime.fromISO(this.selectedDate).toFormat(DATE_TIME_WITHOUT_SECONDS)
      this.selectedDate = ''
      this.dateSelecterFor = ''
      if (propagate) this.$emit('period-selected', this.isValidPeriod, this.from, this.to)
    },
    setDateSelecterFor (value) {
      this.dateSelecterFor = value
      this.selectedDate = ''
      this.triggerDatePicker()
    },
    triggerDatePicker () {
      if (this.dateSelecterFor === 'from' && !this.initialPeriod.from) this.$root.$emit('calendar-min-date', DateTime.local())
      this.$root.$emit('open-calendar', DateTime.fromFormat(this[this.dateSelecterFor], DATE_TIME_WITHOUT_SECONDS) || DateTime.local())
    }
  }
}
</script>
