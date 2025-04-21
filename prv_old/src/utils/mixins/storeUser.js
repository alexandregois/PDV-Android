import { mapState, mapActions } from 'vuex'

export default {
  computed: {
    ...mapState(['user'])
  },
  methods: {
    ...mapActions('user', [
      'userSetProfile',
      'userSetAuthToken',
      'userReset'
    ])
  }
}
