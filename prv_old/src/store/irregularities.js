import { initialStateByModule } from './state'

const IRREGULARITIES_SET_ITEMS = 'irregularitiesSetItems'

const state = initialStateByModule('irregularities')
const getters = {}
const mutations = {
  [IRREGULARITIES_SET_ITEMS]: (state, payload) => {
    state.items = [...payload]
  }
}
const actions = {
  [IRREGULARITIES_SET_ITEMS]: ({ commit }, payload) => commit(IRREGULARITIES_SET_ITEMS, payload)
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
