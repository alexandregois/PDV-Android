import { DateTime } from 'luxon'

export default {
  data () {
    return {
      clockId: 0,
      now: DateTime.local(),
      parkingLot: 0,
      chargeByPeriod: 0,
      periodDuration: 0,
      period: 0
    }
  },
  computed: {
    maxPeriodThatCanBeBought () {
      const end = DateTime.fromISO(this.parking.workingHours.end)
      const reference = this.isRevalidation && this.originalTo ? this.originalTo : this.originalValidity ? this.originalValidity : this.now
      const period = end.diff(reference, 'seconds')
      return Math.ceil(period / this.periodDuration / 1000)
    }
  },
  beforeDestroy () {
    this.stopClock()
  },
  created () {
    this.$root.$on('toggle-clock', state => {
      if (state) return this.startClock()
      this.stopClock()
    })
  },
  methods: {
    clock () {
      this.now = DateTime.local()
    },
    stopClock () {
      if (!this.clockId) return
      clearInterval(this.clockId)
    },
    startClock () {
      this.clock()
      const self = this
      this.clockId = setInterval(function () {
        self.clock()
      }, 1000)
    },
    async fetchChargeByPeriod () {
      try {
        const { data } = await this.$api.fetchIrregularitiesConfig(this.parkingLot)
        this.chargeByPeriod = data.chargeByPeriod
        this.periodDuration = data.periodDuration
      } catch (err) {
        console.debug(err)
      }
    }
  }
}
