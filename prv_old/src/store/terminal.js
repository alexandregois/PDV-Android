import { initialStateByModule } from '@/store/state'

const TERMINAL_SET_NUM_LOGIC = 'terminalSetNumLogic'

const state = initialStateByModule('terminal')
const getters = {}
const mutations = {
  [TERMINAL_SET_NUM_LOGIC]: (state, payload) => {
    state.numLogic = payload
  }
}
const actions = {
  [TERMINAL_SET_NUM_LOGIC]: ({ commit }, payload) => commit(TERMINAL_SET_NUM_LOGIC, payload)
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
