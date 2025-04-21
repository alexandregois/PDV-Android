<template lang="pug">
  .container.mt-4
    .card
      .card-header
        h6.small.text-center Ticket válido para o veículo placa #[strong {{ ticket.vehicle ? ticket.vehicle.placa : '' }}]
      .card-body
        .d-flex.justify-content-between
          .div
            h6 Válido de
          .div
            h6 {{ start | periodToBR }}h
        .d-flex.justify-content-between
          .div
            h6 Válido até
          .div
            h6 {{ validity | periodToBR }}h
      .card-footer
        .pb-2
          h6 Aproveite sua estadia e conte conosco sempre que precisar :)
        .small.text-center.pt-2.border-top
          | esta confirmação será fechada automaticamente em
          span.timer(:class="{ blink, 'text-danger': blink || !redirectAt }") {{ redirectAt | pluralize('segundo', 'segundos', true) }}
        .small.text-center.pt-2
          | ou clique #[a.font-weight-bold(@click.prevent="redirectToMain()") aqui] para fechar
    payment-ok-bottom-bar(
      :ticket="ticket"
      @send="sendClicked"
      @send-cancelled="sendClicked"
    )
</template>

<script>
import PaymentOkBottomBar from '@/components/commons/PaymentOkBottomBar'
import { REDIRECT_INTERVAL } from '@/utils/constants'
import commons from '@/utils/mixins/commons'
import { DateTime } from 'luxon'
import { inRange } from 'lodash'

export default {
  name: 'PaymentOK',
  mixins: [commons],
  components: {
    PaymentOkBottomBar
  },
  props: {
    authorizationCode: String
  },
  data () {
    return {
      redirectListenerId: '',
      redirectTime: null,
      frozenListenerId: '',
      frozen: null,
      ticket: {},
      now: null,
      stopTimer: false
    }
  },
  computed: {
    validity () {
      if (!this.ticket.dt_hr_saida) return ''
      return DateTime.fromISO(this.ticket.dt_hr_saida)
    },
    start () {
      if (!this.ticket.dt_hr_entrada) return ''
      return DateTime.fromISO(this.ticket.dt_hr_entrada)
    },
    blink () {
      return inRange(this.redirectAt, 1, 11)
    },
    redirectAt () {
      if (!this.redirectTime) return 0
      const timer = Math.ceil(this.redirectTime.diff(this.now, 'seconds').seconds)
      return timer > 0 ? timer : 0
    }
  },
  async created () {
    this.toggleShowLoading(true)
    await this.fetchTicket()
    this.startRedirectListener()
  },
  beforeDestroy () {
    this.stopRedirectListener()
  },
  watch: {
    redirectAt (newValue, oldValue) {
      if (!oldValue || newValue) return
      this.redirectToMain()
    }
  },
  methods: {
    async fetchTicket () {
      try {
        const id = this.$route.params.id
        const response = await this.$api.fetchParking(id)
        if (response.status !== 200) throw response
        this.ticket = response.data
      } catch (err) {
        console.debug(err)
      }
    },
    sendClicked (channel) {
      this.stopTimer = !this.stopTimer
      if (this.stopTimer) {
        this.frozen = DateTime.local()
        this.stopRedirectListener()
        return
      }
      const frozen = Math.trunc(DateTime.local().diff(this.frozen, 'seconds').seconds)
      this.redirectTime = this.redirectTime.plus({ seconds: frozen })
      this.startRedirectListener()
    },
    setNow () {
      this.now = DateTime.local()
    },
    redirectInterval () {
      const left = Math.trunc(REDIRECT_INTERVAL / 1000)
      return this.now.plus({ seconds: left })
    },
    startRedirectListener () {
      this.setNow()
      if (!this.redirectTime) this.redirectTime = this.redirectInterval()
      const self = this
      this.redirectListenerId = setInterval(function () {
        self.setNow()
      }, 1000)
      this.toggleShowLoading(false)
    },
    stopRedirectListener () {
      if (!this.redirectListenerId) return
      clearInterval(this.redirectListenerId)
      this.redirectListenerId = ''
    },
    redirectToMain () {
      this.stopRedirectListener()
      this.redirectTo('Buy Parking Time')
    }
  }
}
</script>

