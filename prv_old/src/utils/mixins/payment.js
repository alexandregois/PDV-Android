import { DATE_BR } from '@/utils/constants'
import commons from '@/utils/mixins/commons'
import storeTerminal from '@/utils/mixins/storeTerminal'
import { Plugins } from '@capacitor/core'
import { DateTime } from 'luxon'

export default {
  mixins: [commons, storeTerminal],
  data () {
    return {
      refundListener: ''
    }
  },
  methods: {
    handleRefund (data) {
      let message = 'Por favor, contate o lojista para providenciar o estorno.'
      if (+data.result === 0) message = 'O pagamento realizado foi estornado. Verifique o estorno na fatura do cartão ou extrato bancário.'
      this.showAlert('Operação não concluída', message)
      this.refundListener.remove()
    },
    async processRefund (data) {
      const refundData = {
        cvNumber: data.nsu,
        transactionDate: DateTime.local().toFormat(DATE_BR),
        amount: data.amount,
        originTerminal: this.terminal.numLogic
      }
      this.refundListener = Plugins.Getnet.addListener('getnetRefundResult', data => this.handleRefund(data))
      await this.$getnet.sendRefundRequest(refundData)
    },
    async processPayment (sendData) {
      this.$root.$emit('hide-alert')
      this.toggleShowLoading(true)
      try {
        const res = await this.$api.registerPayment(sendData)
        if (res.status !== 200 && res.status !== 201) throw res
        return res
      } catch (err) {
        console.debug(err)
        return err
      } finally {
        this.toggleShowLoading(false)
      }
    }
  }
}
