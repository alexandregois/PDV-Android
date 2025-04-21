import { initialStateByModule } from './state'

const PARKING_SET_WORKING_HOURS = 'parkingSetWorkingHours'

const state = initialStateByModule('parking')
const getters = {}
const mutations = {
  [PARKING_SET_WORKING_HOURS]: (state, payload) => {
    Object.assign(state.workingHours, payload)
  }
}
const actions = {
  [PARKING_SET_WORKING_HOURS]: ({ commit }, payload) => commit(PARKING_SET_WORKING_HOURS, payload)
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
