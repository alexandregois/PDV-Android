import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import { APP_STORE_NAME } from '@/utils/constants'
import terminal from './terminal'
import user from './user'
import parking from './parking'
import irregularities from './irregularities'

Vue.use(Vuex)

const persistLocalStorage = createPersistedState({
  key: APP_STORE_NAME,
  reducer: state => ({
    terminal: state.terminal,
    user: state.user,
    parking: state.parking,
    irregularities: state.irregularities
  })
})

const store = new Vuex.Store({
  plugins: [persistLocalStorage],
  modules: {
    terminal,
    user,
    parking,
    irregularities
  }
})

export default store
