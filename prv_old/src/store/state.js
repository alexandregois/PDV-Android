import { APP_STORE_NAME } from '@/utils/constants'
import { defaultsDeep, difference, forEach, keys } from 'lodash'

const state = {
  terminal: {
    numLogic: ''
  },
  user: {
    id: '',
    email: '',
    cpf: '',
    firstName: '',
    lastName: '',
    avatar: '',
    balance: 0.0,
    keepLogged: false,
    verificationCode: '', // encrypted password
    verificationToken: '', // auth token
    receiveNews: false
  },
  parking: {
    workingHours: {
      start: '',
      end: ''
    }
  },
  irregularities: {
    items: []
  }
}

const appLocalStorage = JSON.parse(localStorage.getItem(APP_STORE_NAME)) || {}
const initialState = removeObsoleteFromStorage()
localStorage.setItem(APP_STORE_NAME, JSON.stringify(initialState))

function removeObsoleteFromStorage () {
  if (appLocalStorage.version !== state.version) return state
  const storageKeys = keys(state)
  forEach(storageKeys, key => {
    const stateKeys = keys(state[key])
    const storageKeys = keys(appLocalStorage[key])
    const toRemove = difference(storageKeys, stateKeys)
    forEach(toRemove, item => {
      delete appLocalStorage[key][item]
    })
  })
  return defaultsDeep(appLocalStorage, state)
}
function initialStateByModule (module) {
  return initialState[module]
}
function zeroStateByModule (module) {
  return state[module]
}

export { initialStateByModule, zeroStateByModule }
