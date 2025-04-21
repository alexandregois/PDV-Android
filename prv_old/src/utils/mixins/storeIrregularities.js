import { DateTime } from 'luxon'
import { mapState, mapActions } from 'vuex'
import { head, filter, inRange } from 'lodash'

export default {
  data () {
    return {
      showingSideMenu: false
    }
  },
  computed: {
    ...mapState(['irregularities', 'parking']),
    showIrregularitiesBar () {
      const inIrregularitiesPage = this.$route.name === 'Irregularities'
      return this.hasIrregularities && !inIrregularitiesPage && !this.showingSideMenu
    },
    hasSameDayIrregularity () {
      return this.sameDayIrregularity !== undefined
    },
    sameDayIrregularity () {
      const startAt = DateTime.fromISO(this.parking.workingHours.start)
      const endsAt = DateTime.fromISO(this.parking.workingHours.end)
      const irregularity = head(filter(this.irregularities.items, irregularity => {
        const start = DateTime.fromISO(irregularity.irr_dt_hora)
        return inRange(start.toMillis(), startAt.toMillis(), endsAt.toMillis() + 1)
      }))
      return irregularity
    },
    hasIrregularities () {
      return this.irregularitiesCount > 0
    },
    irregularitiesCount () {
      return this.irregularities.items.length
    }
  },
  created () {
    this.$root.$on('toggle-menu', state => {
      this.showingSideMenu = state
    })
  },
  watch: {
    irregularitiesCount: {
      immediate: false,
      handler: function (value) {
        if (!value) return
        this.$root.$emit('new-irregularity-annotation')
      }
    }
  },
  methods: {
    ...mapActions('irregularities', [
      'irregularitiesSetItems'
    ])
  }
}
