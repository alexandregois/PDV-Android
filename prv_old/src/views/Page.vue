<template lang="pug">
  div.mt-2
    alert-message(
      v-if="showAlert"
    )
    transition(
      name="fade"
      mode="out-in"
    )
      router-view
</template>

<script>
import AlertMessage from '@/components/commons/Alert'

export default {
  name: 'Page',
  components: {
    AlertMessage
  },
  data () {
    return {
      showAlert: false
    }
  },
  created () {
    this.$root.$on('show-alert', () => {
      this.showAlert = true
    })
    this.$root.$on('hide-alert', () => {
      this.showAlert = false
    })
  }
}
</script>
