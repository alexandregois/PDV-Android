import { mapState, mapActions } from 'vuex'

export default {
  computed: {
    ...mapState(['terminal'])
  },
  methods: {
    ...mapActions('terminal', ['terminalSetNumLogic'])
  }
}
