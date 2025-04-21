import VueApiService from 'vue-axios-api-service'
import store from '@/store'
import { encrypt } from '@/utils/crypt'

export default class ApiService extends VueApiService {
  constructor () {
    const AXIOS_OPTIONS = {
      baseURL: process.env.VUE_APP_API
    }
    super(AXIOS_OPTIONS)
  }

  async beforeRequest () {
    const headers = {
      client: await encrypt({ client: 'App' }, process.env.VUE_APP_SALT)
    }
    const token = store.state.user.verificationToken
    if (token) Object.assign(headers, { authorization: `Bearer ${store.state.user.verificationToken}` })
    return headers
  }

  async updateIrregularity (data, id) {
    const params = {
      url: `irregularities/${id}`,
      method: 'patch',
      data
    }
    return this.exec(params)
  }

  async fetchIrregularity (id) {
    const params = {
      url: `irregularities/${id}`,
      method: 'get'
    }
    return this.exec(params)
  }

  async fetchIrregularities (licencePlate) {
    const params = {
      url: `irregularities/${licencePlate.toUpperCase()}`,
      method: 'get'
    }
    return this.exec(params)
  }

  async fetchIrregularitiesConfig (subSector) {
    const params = {
      url: `irregularities/config/${subSector}`,
      method: 'get'
    }
    return this.exec(params)
  }

  async sendTicketBySMS (data) {
    const params = {
      url: 'parking/send/sms',
      method: 'post',
      data
    }
    return this.exec(params)
  }

  async sendTicketByEmail (data) {
    const params = {
      url: 'parking/send/email',
      method: 'post',
      data
    }
    return this.exec(params)
  }

  async extendParkingTime (data) {
    const params = {
      url: 'parking',
      method: 'patch',
      data
    }
    return this.exec(params)
  }

  async buyParkingTime (data) {
    const params = {
      url: 'parking',
      method: 'post',
      data
    }
    return this.exec(params)
  }

  async fetchParkingByLicencePlate (licencePlate) {
    const params = {
      url: `parking/${licencePlate.toUpperCase()}`,
      method: 'get'
    }
    return this.exec(params)
  }

  async fetchParking (id) {
    const params = {
      url: `parking/${id}`,
      method: 'get'
    }
    return this.exec(params)
  }

  async registerPayment (data) {
    const params = {
      url: 'payment',
      method: 'post',
      data
    }
    return this.exec(params)
  }

  async fetchVehicleByLicencePlate (licencePlate) {
    const params = {
      url: `vehicles/${licencePlate.toUpperCase()}`,
      method: 'get'
    }
    return this.exec(params)
  }

  async updateUser (data, id) {
    const params = {
      url: `users/${id}`,
      method: 'patch',
      data
    }
    return this.exec(params)
  }

  async createUser (data) {
    const params = {
      url: 'users',
      method: 'post',
      data
    }
    return this.exec(params)
  }

  async validateResetPasswordCode (data) {
    const params = {
      url: 'validate-reset-password-code',
      method: 'post',
      data
    }
    return this.exec(params)
  }

  async resetPassword (data, id) {
    const params = {
      url: `forgot-password/${id}`,
      method: 'patch',
      data
    }
    return this.exec(params)
  }

  async sendResetPasswordCode (data) {
    const params = {
      url: 'forgot-password',
      method: 'post',
      data
    }
    return this.exec(params)
  }

  async fetchUserByEmail (email) {
    const params = {
      url: `users/${email}`,
      method: 'get'
    }
    return this.exec(params)
  }

  async cpfAvailable (cpf) {
    const params = {
      url: `cpf-available/${cpf}`,
      method: 'get'
    }
    return this.exec(params)
  }

  async emailAvailable (email) {
    const params = {
      url: `email-available/${email}`,
      method: 'get'
    }
    return this.exec(params)
  }

  async login (data) {
    const params = {
      url: 'login',
      method: 'post',
      data
    }
    return this.exec(params)
  }

  async fetchActualVersion () {
    const params = {
      url: 'versions/App',
      method: 'get'
    }
    return this.exec(params)
  }
}
