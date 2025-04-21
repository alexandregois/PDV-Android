<template lang="pug">
  .container
    .card.rounded.semi-transparent
      .card-body
        .row
          .col-12
            h6 Utilize seu e-mail e senha cadastados para acessar:
        .row
          .col-12
            form
              .form-group
                .form-input
                  custom-input(
                    type="email"
                    :value="email"
                    :validation="emailValidation"
                    @change="setEmail"
                    placeholder="E-mail"
                    auto-complete="current-email"
                  )
              .form-group
                .form-input
                  custom-input(
                    type="password"
                    :value="password"
                    :validation="passwordValidation"
                    @change="setPassword"
                    placeholder="Senha"
                    auto-complete="current-password"
                  )
              .form-group.text-center.pt-1
                button.btn.btn-rounded.text-uppercase(
                  type="button"
                  :class="{ disabled: btnDisabled, 'btn-outline-secondary': btnDisabled, 'btn-primary': !btnDisabled }"
                  @click="submit"
                )
                  | Acessar
              .form-group.w-100.d-inline-flex.justify-content-between.mt-3
                a.text-blue.small.text-uppercase(
                  href=""
                  @click.prevent="redirectTo('Forgot Password')"
                )
                  | Esqueci minha senha
                a.text-blue.small.text-uppercase(
                  href=""
                  @click.prevent="redirectTo('Contact Us')"
                )
                  | Fale conosco
    .row.mt-4.invisible
      .col-12.text-center
        .card.semi-transparent.rounded
          .card-body
            .small Ainda não é cadastrado?
            a.text-blue(
              href=""
              @click.prevent="redirectTo('Register')"
            )
              | Clique aqui para se cadastrar como lojista
</template>

<script>
import CustomInput from '@/components/commons/Input'
import { PROFILE } from '@/utils/constants'
import { APP_MESSAGES } from '@/utils/constants/messages'
import { encrypt } from '@/utils/crypt'
import commons from '@/utils/mixins/commons'
import storeParking from '@/utils/mixins/storeParking'
import storeUser from '@/utils/mixins/storeUser'
import { Plugins } from '@capacitor/core'
import { required, email, minLength } from 'vuelidate/lib/validators'

export default {
  name: 'Home',
  mixins: [commons, storeUser, storeParking],
  components: {
    CustomInput
  },
  data () {
    return {
      email: '',
      password: '',
      sending: false,
      appVersion: ''
    }
  },
  validations: {
    email: {
      required,
      blackListEmail: value => ['teste@teste.com', 'teste@teste.com.br'].indexOf(value) === -1,
      email
    },
    password: {
      required,
      minLength: minLength(6)
    }
  },
  computed: {
    passwordValidation () {
      const validations = [
        {
          type: 'error',
          msg: 'Informe sua senha',
          valid: false
        }
      ]
      if (!this.$v.password.$invalid && this.password) return { type: 'success', valid: true }
      if (this.$v.password.$invalid && this.$v.password.$dirty) return validations[0]
      return {}
    },
    emailValidation () {
      const validations = [
        {
          type: 'error',
          msg: 'Informe seu e-mail cadastrado',
          valid: false
        },
        {
          type: 'error',
          msg: 'Por favor, insira um e-mail válido',
          valid: false
        }
      ]
      if (!this.$v.email.$invalid && this.email) return { type: 'success', valid: true }
      if (this.$v.email.$dirty && !this.$v.email.required) return validations[0]
      if ((this.$v.email.$dirty && this.$v.email.$invalid) || !this.$v.email.email) return validations[1]
      return {}
    },
    appUpdated () {
      return true // this.appVersion === process.env.PACKAGE_VERSION
    },
    btnDisabled () {
      return this.$v.$invalid || this.sending || !this.appUpdated
    }
  },
  async mounted () {
    await Plugins.SplashScreen.hide()
    // await this.checkVersion()
  },
  methods: {
    async profile (profile) {
      const userData = {
        ...profile,
        verificationCode: encrypt({ password: this.password }, process.env.VUE_APP_SALT)
      }
      await this.userSetProfile(userData)
    },
    async submit () {
      this.$root.$emit('hide-alert')
      if (this.btnDisabled) return
      this.sending = true
      this.toggleShowLoading(true)
      try {
        const sendData = {
          email: this.email,
          password: this.password,
          profile: PROFILE
        }
        const { data } = await this.$api.login(sendData)
        await this.userSetAuthToken(data.token)
        await this.profile(data.profile)
        await this.parkingSetWorkingHours(data.workingHours)
        this.redirectTo('Buy Parking Time')
      } catch (err) {
        console.debug(err)
        this.$root.$emit('show-alert', 'warning', err.response.statusText || APP_MESSAGES.wrongUserPassword)
      } finally {
        this.sending = false
        this.toggleShowLoading(false)
      }
    },
    async checkVersion () {
      try {
        const res = await this.$api.fetchActualVersion()
        const { data } = res
        this.appVersion = data.version
        if (!this.appUpdated) this.$root.$emit('show-alert', 'info', APP_MESSAGES.newVersionAvailable)
      } catch (err) {
        console.debug(err)
      }
    },
    setPassword (value) {
      this.$v.password.$touch()
      this.password = value
    },
    setEmail (value) {
      this.$v.email.$touch()
      this.email = value
    }
  }
}
</script>
