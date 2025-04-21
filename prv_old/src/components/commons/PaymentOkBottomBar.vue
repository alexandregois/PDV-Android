<template lang="pug">
  .fixed-bottom.w-100.bg-primary.text-white
    .container
      .mt-3.text-center
        h6.small.text-white.text-uppercase Quer receber as informações deste ticket?
      .d-flex.justify-content-between.align-items-center
          div
            button.btn.btn-lg.d-flex.flex-column.justify-content-center.align-items-center(
              type="button"
              @click="sendBy('email').then(() => {})"
            )
              .payment-bottom-bar
                i.fas.fa-envelope.fa-2x
              .small.text-white.text-uppercase por e-mail
          div
            button.btn.btn-lg.d-flex.flex-column.justify-content-center.align-items-center(
              type="button"
              @click="sendBy('sms').then(() => {})"
            )
              .payment-bottom-bar
                i.fas.fa-sms.fa-2x
              .small.text-white.text-uppercase por SMS
</template>

<script>
import { APP_MESSAGES } from '@/utils/constants/messages'
import commons from '@/utils/mixins/commons'
import { Plugins } from '@capacitor/core'
import emailValidator from 'email-validator'
import phoneValidator from 'phone'

export default {
  name: 'PaymentOkBottomBar',
  mixins: [commons],
  props: {
    ticket: Object
  },
  data () {
    return {
      sendCounter: -1
    }
  },
  methods: {
    async handleSendBySMS (phone) {
      if (!(/^\+[0-9]+/).test(phone)) phone = `+55${phone}`
      if (phoneValidator(phone).length === 0) return this.promptToAnswer('sms')
      try {
        const sendData = {
          to: phone.replace(/[^0-9]/g, ''),
          id: `${this.ticket.id_ocupacao}-${++this.sendCounter}`
        }
        const response = await this.$api.sendTicketBySMS(sendData)
        if (response.status !== 200) throw new Error()
        return true
      } catch (err) {
        console.debug(err)
        return false
      }
    },
    async handleSendByEmail (email) {
      if (!emailValidator.validate(email)) return this.promptToAnswer('email')
      try {
        const sendData = {
          email,
          id: this.ticket.id_ocupacao
        }
        const response = await this.$api.sendTicketByEmail(sendData)
        if (response.status !== 200) throw response
        return true
      } catch (err) {
        console.debug(err)
        return false
      }
    },
    async promptToAnswer (channel) {
      const options = {
        email: {
          title: 'Enviar por e-mail',
          message: 'Informe o e-mail para onde devemos enviar os dados do ticket:'
        },
        sms: {
          title: 'Enviar por SMS',
          message: 'Informe o número do telefone com DDD para onde devemos enviar os dados do ticket - for a non brazilian phone number, please type the full number including country code and area code (e.g.: +1 for US/Canada):'
        }
      }
      const answer = await Plugins.Modals.prompt(options[channel])
      if (answer.cancelled) return null
      this.toggleShowLoading(true)
      if (channel === 'email') return this.handleSendByEmail(answer.value)
      return this.handleSendBySMS(answer.value.replace(/[^0-9+]/g, ''))
    },
    async sendBy (channel) {
      this.$emit('send', channel)
      const send = await this.promptToAnswer(channel)
      this.toggleShowLoading(false)
      if (send === null) return this.$emit('send-cancelled', channel)
      const title = send ? 'Enviado com sucesso!' : 'Ocorreu um erro no envio'
      const message = send ? APP_MESSAGES.sendTicketSuccess : APP_MESSAGES.sendTicketError
      this.showAlert(title, message)
      this.$emit('send-cancelled', channel)
    }
  }
}
</script>
