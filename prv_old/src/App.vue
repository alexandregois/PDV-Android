<template lang="pug">
  #app(
    :class="{ 'bg-fill': useBgFill } "
  )
    transition(
      name="fade"
      mode="out-in"
    )
      router-view
</template>

<script>
import storeTerminal from '@/utils/mixins/storeTerminal'
import { Plugins } from '@capacitor/core'

export default {
  name: 'App',
  mixins: [storeTerminal],
  data () {
    return {
      getnetListener: ''
    }
  },
  computed: {
    useBgFill () {
      return this.$route.meta.bgFill
    }
  },
  async created () {
    this.getnetListener = await Plugins.Getnet.addListener('getnetInfosResult', data => this.handleGetnetResponse(data))
    await this.$getnet.getTerminalInfo()
  },
  methods: {
    handleGetnetResponse (data) {
      this.res = data
      const { numlogic } = data
      this.terminalSetNumLogic(numlogic)
        .then(() => this.getnetListener.remove())
    }
  }
}
</script>
