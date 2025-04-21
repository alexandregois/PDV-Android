<template lang="pug">
  .loader
    .loader__content
      .loader__content__spin
        img(src='~@/assets/images/spin.png')
      .loader__content__logo.hide
        img(src='~@/assets/images/logo.png')
</template>

<script>
export default {
  name: 'Loader',
  mounted () {
    const el = document.getElementsByClassName('loader')[0]
    el.style.top = `${window.scrollY}px`
  }
}
</script>
