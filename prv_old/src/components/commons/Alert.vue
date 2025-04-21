<template lang="pug">
  .alert-container.text-center(
    v-if="show"
    :class="{ 'alert-container__active': show }"
    @click="hideAlert"
  )
    .alert.alert-dismissible(
      role="alert"
      :class="{ [`alert-${variant}`]: true }"
    )
      span(v-html="icon")
      |  {{ text }}
</template>

<script>
import { filter, get, head } from 'lodash'

export default {
  name: 'Alert',
  data () {
    return {
      show: false,
      variant: '',
      text: ''
    }
  },
  watch: {
    show (value) {
      if (!value) return
      const self = this
      setTimeout(function () {
        const el = document.getElementsByClassName('alert-container')[0]
        el.style.top = `${window.scrollY}px`
      }, 40)
      setTimeout(function () {
        self.hideAlert()
      }, 8000)
    }
  },
  computed: {
    icon () {
      const variants = [
        { variant: 'success', icon: 'check-circle' },
        { variant: 'info', icon: 'info-circle' },
        { variant: 'warning', icon: 'exclamation-triangle' },
        { variant: 'danger', icon: 'exclamation-circle' }
      ]
      const icon = get(head(filter(variants, ({ variant }) => variant === this.variant)), 'icon')
      return `<i class="fas fa-${icon}"></i>`
    }
  },
  created () {
    this.$root.$on('show-alert', (variant, text) => {
      this.variant = variant
      this.text = text
      this.show = true
    })
    this.$root.$on('hide-alert', () => {
      this.hideAlert()
    })
    // @todo: add listener to reposition alert on scroll
  },
  methods: {
    hideAlert () {
      // @todo: add overflow auto
      this.text = ''
      this.show = false
    }
  }
}
</script>
