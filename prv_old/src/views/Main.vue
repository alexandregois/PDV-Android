<template lang="pug">
  .container-fluid.m-0.p-0
    app-header
    transition(
      name="fade"
      mode="out-in"
    )
      router-view
    app-loader(
      v-if="showLoading"
    )
</template>

<script>
import AppHeader from '@/components/commons/Header'
import AppLoader from '@/components/commons/Loader'
import commons from '@/utils/mixins/commons'

export default {
  name: 'Main',
  mixins: [commons],
  components: {
    AppHeader,
    AppLoader
  }
}
</script>
