import { initialStateByModule, zeroStateByModule } from './state'

const USER_SET_AUTH_TOKEN = 'userSetAuthToken'
const USER_SET_PROFILE = 'userSetProfile'
const USER_RESET = 'userReset'

const zeroState = zeroStateByModule('user')

const state = initialStateByModule('user')
const getters = {}
const mutations = {
  [USER_SET_PROFILE]: (state, payload) => {
    state.id = payload.ID
    state.email = payload.email
    state.cpf = payload.username
    state.firstName = payload.first_name
    state.lastName = payload.last_name
    state.avatar = payload.avatar
    state.balance = +payload.points
    state.keepLogged = payload.keepLogged
    state.receiveNews = Boolean(payload.email_notification)
    state.verificationCode = payload.verificationCode
  },
  [USER_SET_AUTH_TOKEN]: (state, payload) => {
    state.verificationToken = payload
  },
  [USER_RESET]: state => {
    const data = { ...zeroState }
    if (state.keepLogged) {
      delete data.email
      delete data.verificationCode
      delete data.keepLogged
    }
    Object.assign(state, data)
  }
}
const actions = {
  [USER_SET_PROFILE]: ({ commit }, payload) => commit(USER_SET_PROFILE, payload),
  [USER_SET_AUTH_TOKEN]: ({ commit }, payload) => commit(USER_SET_AUTH_TOKEN, payload),
  [USER_RESET]: ({ commit }) => commit(USER_RESET)
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
