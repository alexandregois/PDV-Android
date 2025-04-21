import { mapState, mapActions } from 'vuex'

export default {
  computed: {
    ...mapState(['parking']),
    myParkingTickets () {
      return this.parking.items
    }
  },
  methods: {
    ...mapActions('parking', [
      'parkingSetWorkingHours'
    ])
  }
}
