<template lang="pug">
nav.navbar.navbar-expand-lg.nav-light.bg-blue.m-0.p-0.mb-1.py-4.d-flex.justify-content-between.flex-column
    .w-100.d-flex.justify-content-between.align-items-center.px-2
      .icon
        i(
          v-if="icon"
          :class="icon"
        )
        img(
          v-else
          :src="require(`@/assets/images/${image}`)"
          width="40"
        )
      .pt-2
        h5.text-white.text-uppercase.text-center {{ title }}
      .fake
</template>

<script>

export default {
  name: 'Header',
  mixins: [],
  data () {
    return {
      title: ''
    }
  },
  computed: {
    image () {
      return this.$route.meta.image
    },
    icon () {
      return this.$route.meta.icon
    }
  },
  created () {
    this.$root.$on('set-title', value => {
      this.title = value
    })
    this.$root.$on('reset-title', value => {
      this.title = this.$route.meta.title
    })
    this.title = this.$route.meta.title
  }
}
</script>

