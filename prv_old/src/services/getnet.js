import { Plugins } from '@capacitor/core'
// import 'capacitor-getnet'

const { Getnet } = Plugins

export default class GetnetService {
  async sendRefundRequest (data) {
    const params = []
    const keys = Object.keys(data)
    keys.forEach(key => params.push(`${key}=${data[key]}`))
    return Getnet.startIntent({ deeplink: `${process.env.VUE_APP_GETNET_API}/refund?${params.join('&')}` })
  }

  async sendPaymentRequest (data) {
    const params = [
      'installments=1'
    ]
    const keys = Object.keys(data)
    keys.forEach(key => params.push(`${key}=${data[key]}`))
    return Getnet.startIntent({ deeplink: `${process.env.VUE_APP_GETNET_API_V3}/payment?${params.join('&')}` })
  }

  async getTerminalInfo () {
    return Getnet.startIntent({ deeplink: `${process.env.VUE_APP_GETNET_API}/getinfos` })
  }
}
