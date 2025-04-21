import Vue from 'vue'
import App from './App.vue'
import router from '@/router'
import store from '@/store'
import Vuelidate from 'vuelidate'
import VueTheMask from 'vue-the-mask'
import Filter from '@/utils/filters'
import ApiService from '@/services/api'
import GetnetService from '@/services/getnet'
import { Plugins } from '@capacitor/core'
import '@/assets/scss/app.scss'
import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'

Vue.config.productionTip = false

library.add(fas)
library.add(far)
library.add(fab)
dom.watch()

Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.use(Filter)
Vue.use(Vuelidate)
Vue.use(VueTheMask)

Vue.prototype.$api = new ApiService()
Vue.prototype.$getnet = new GetnetService()

new Vue({
  router,
  store,
  render: h => h(App),
  created () {
    Plugins.App.addListener('backButton', event => {
      event.preventDefault()
      event.stopPropagation()
    })
  }
}).$mount('#app')
