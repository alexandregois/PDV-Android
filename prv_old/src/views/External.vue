<template lang="pug">
  .container-fluid.h-100.d-flex.flex-column.justify-content-start.p-0.m-0
    nav.nav-expand-lg.nav-light.bg-trasparent.my-2.py-2
      .container-fluid.text-center
        img(
          src="~@/assets/images/logo.png"
          width="182"
          height="60"
        )
    alert-message
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
import AppLoader from '@/components/commons/Loader'
import AlertMessage from '@/components/commons/Alert'
import AppHeader from '@/components/commons/Header'
import commons from '@/utils/mixins/commons'

export default {
  name: 'External',
  mixins: [commons],
  components: {
    AppLoader,
    AlertMessage,
    AppHeader
  }
}
</script>
