<template >
  <div class="container px-0 mx-0 free-bottom">
    <div class="row" v-show="applyFirstHourDiscount">
      <div class="col-8 offset-2">
        <button
          class="btn text-uppercase font-weight-bold"
          type="button"
          :class="{ disabled: btnDisabled && !period, 'btn-success': btnDisabled && period }"
          @click="createDiscountTicket"
          :disabled="btnDisabled"
        >
          gerar ticket com desconto
        </button>
      </div>
    </div>
    <div class="row" >
      <div class="col-6">
        <button
          class="btn w-100 text-uppercase font-weight-bold"
          type="button"
          :class="{
            disabled: btnDisabled,
            'btn-outline-secondary': btnDisabled,
            'btn-primary': !btnDisabled,
          }"
          :disabled="btnDisabled"
          @click="confirmSubmit(paymentDebit)"
        >
          pagar com débito
        </button>
      </div>
      <div class="col-6">
        <button
          class="btn w-100 text-uppercase font-weight-bold"
          type="button"
          :class="{
            disabled: btnDisabled,
            'btn-outline-secondary': btnDisabled,
            'btn-success': !btnDisabled,
          }"
          :disabled="btnDisabled"
          @click="confirmSubmit(paymentCredit)"
        >
          pagar com crédito
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { PAYMENT_CREDIT, PAYMENT_DEBIT } from '@/utils/constants'
import {
  PAYMENT_MESSAGES_TITLE,
  PAYMENT_MESSAGES
} from '@/utils/constants/messages'
import commons from '@/utils/mixins/commons'
import storeTerminal from '@/utils/mixins/storeTerminal'
import { Plugins } from '@capacitor/core'
import Filter from '@/utils/filters'

export default {
  name: 'Payment',
  mixins: [commons, storeTerminal],
  data () {
    return {
      getnetListener: '',
      result: '',
      sending: false
    }
  },
  props: {
    amount: {
      type: Number,
      default: 0
    },
    period: {
      type: Number,
      default: 0
    },
    vehicle: {
      type: Object,
      default: () => {}
    },
    btnDisabled: Boolean
  },
  computed: {
    cardTypeLabel () {
      return {
        [this.paymentDebit]: 'débito',
        [this.paymentCredit]: 'crédito'
      }
    },
    paymentCredit () {
      return PAYMENT_CREDIT
    },
    paymentDebit () {
      return PAYMENT_DEBIT
    },
    applyFirstHourDiscount () {
      return (
        this.vehicle &&
        this.vehicle.discount &&
        this.vehicle.applyFirstHourDiscount
      )
    }
  },
  created () {
    this.sending = false
    this.getnetListener = Plugins.Getnet.addListener(
      'getnetPaymentResult',
      (data) => this.handlePayment(data)
    )
    this.$parent.$on('toggle-sending', (state) => {
      this.sending = state
    })
  },
  beforeDestroy () {
    this.getnetListener.remove()
  },
  methods: {
    async confirmSubmit (paymentType) {
      if (this.btnDisabled || this.sending) return
      this.sending = true
      const message = `Confirma o pagamento via cartão de ${this.cardTypeLabel[paymentType]}?`
      const confirmRet = await Plugins.Modals.confirm({
        title: 'Confirme a forma de pagamento',
        message,
        okButtonTitle: 'SIM',
        cancelButtonTitle: 'Não'
      })
      if (confirmRet.value) return this.submit(paymentType)
      this.sending = false
    },
    async submit (paymentType) {
      const sendData = {
        paymentType,
        amount: Filter.formatGetnetValue(this.amount),
        callerId: crypto.randomUUID

      }
      await this.$getnet.sendPaymentRequest(sendData)
    },
    createDiscountTicket () {
      if (!this.period) return
      this.$emit('payment-response', {})
    },
    handlePayment (data) {
      if (+data.result !== 0) {
        this.showAlert(
          PAYMENT_MESSAGES_TITLE[+data.result],
          PAYMENT_MESSAGES[+data.result]
        )
        this.$emit('payment-error')
        return
      }
      const { numLogic } = this.terminal
      const { type, nsu, gmtDateTime } = data
      const paymentId = `${type}-${nsu}-${numLogic}-${gmtDateTime}`
      Object.assign(data, { paymentId })
      this.$emit('payment-response', data)
    }
  }
}
</script>
