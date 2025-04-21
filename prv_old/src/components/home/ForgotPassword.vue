<template lang="pug">
  .container.d-flex.flex-column.justify-content-center
    .card.rounded.semi-transparent
      .card-body
        .row(
          :class="{ expanded: expanded === 'code', collapsed: expanded !== 'code' }"
        )
          .col-12
            h6 Utilize o formulário abaixo para solicitar as instruções de redefinição de sua senha:
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
        .row
          .col-12
            .form-group.text-center.pt-3
              button.btn.btn-rounded.text-uppercase(
                type="button"
                :class="{ disabled: askCodeBtnDisabled, 'btn-outline-secondary': askCodeBtnDisabled, 'btn-outline-primary': !askCodeBtnDisabled }"
                @click="setExpanded('code')"
              )
                | Solicitar alteração de senha
        .row(
          :class="{ expanded: expanded === 'redefine', collapsed: expanded !== 'redefine' }"
        )
          .col-12
            h6 Altere sua senha:
          .col-12
            form
              .form-group
                .form-input
                  custom-input(
                    type="tel"
                    :value="confirmationCode"
                    :validation="confirmationCodeValidation"
                    @change="setConfirmationCode"
                    placeholder="Código de alteração"
                    auto-complete="code-confirmation"
                  )
                .form-input
                  input.hide(
                    type="text"
                    name="username"
                    value="username"
                    autocomplete="current-username"
                  )
                  custom-input(
                    :class="{ disabled: !confirmationCodeValid }"
                    type="password"
                    :value="password"
                    :validation="passwordValidation"
                    @change="setPassword"
                    placeholder="Nova senha"
                    auto-complete="new-password"
                  )
              .form-group
                .form-input
                  custom-input(
                    :class="{ disabled: !confirmationCodeValid }"
                    type="password"
                    :value="passwordConfirm"
                    :validation="passwordConfirmValidation"
                    @change="setPasswordConfirm"
                    placeholder="Confirme a nova senha"
                    auto-complete="new-password-confirmation"
                  )
        .row
          .col-12
            .form-group.text-center.pt-3
              button.btn.btn-rounded.text-uppercase(
                type="button"
                :class="{ disabled: redefinePasswordBtnDisabled, 'btn-outline-secondary': redefinePasswordBtnDisabled, 'btn-outline-primary': !redefinePasswordBtnDisabled }"
                @click="setExpanded('redefine')"
              )
                | {{ redefinePasswordButtonLabel }}
    .row.my-4
      .col-12.text-center
        button.btn.btn-rounded.border-0.text-blue.semi-transparent(
          type="button"
          @click="redirectTo('Home')"
        )
          i.fas.fa-arrow-left
          |  Voltar
</template>

<script>
import CustomInput from '@/components/commons/Input'
import commons from '@/utils/mixins/commons'
import ip from 'ip'
import { required, email, minLength, maxLength, numeric, sameAs } from 'vuelidate/lib/validators'

export default {
  name: 'ForgotPassword',
  mixins: [commons],
  components: {
    CustomInput
  },
  data () {
    return {
      expanded: 'code',
      id: '',
      email: '',
      password: '',
      passwordConfirm: '',
      confirmationCode: '',
      sending: false
    }
  },
  validations: {
    email: {
      required,
      userExists: async function (value) {
        if (!this.$v.email.email || !this.$v.email.$dirty) return true
        try {
          await this.$api.fetchUserByEmail(value)
          return true
        } catch {
          return false
        }
      },
      blackListEmail: value => ['teste@teste.com', 'teste@teste.com.br'].indexOf(value) === -1,
      maxLength: maxLength(255),
      email
    },
    password: {
      required,
      minLength: minLength(6)
    },
    passwordConfirm: {
      required,
      sameAs: sameAs('password')
    },
    confirmationCode: {
      required,
      isValid: async function (value) {
        if (!this.$v.confirmationCode.minLength || !this.$v.confirmationCode.numeric || !this.$v.confirmationCode.$dirty) return
        try {
          const sendData = {
            code: value
          }
          const { data } = await this.$api.validateResetPasswordCode(sendData)
          if (!data.user) throw new Error()
          this.id = data.user
          return true
        } catch {
          this.id = ''
          return false
        }
      },
      minLength: minLength(6),
      maxLength: maxLength(6),
      numeric
    }
  },
  computed: {
    confirmationCodeValidation () {
      const validations = [
        {
          type: 'error',
          msg: 'Informe o código recebido',
          valid: false
        },
        {
          type: 'error',
          msg: 'Código inválido',
          valid: false
        }
      ]
      if (!this.$v.confirmationCode.$invalid && this.confirmationCode) return { type: 'success', valid: true }
      if (!this.$v.confirmationCode.isValid && this.$v.confirmationCode.$dirty) return validations[1]
      if (this.$v.confirmationCode.$dirty) return validations[0]
      return {}
    },
    passwordConfirmValidation () {
      const validations = [
        {
          type: 'error',
          msg: 'A senha e a confirmação não conferem',
          valid: false
        }
      ]
      if (!this.$v.passwordConfirm.$invalid && this.passwordConfirm) return { type: 'success', valid: true }
      if (this.$v.passwordConfirm.$invalid && this.$v.passwordConfirm.$dirty) return validations[0]
      return {}
    },
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
          msg: 'Informe um e-mail válido',
          valid: false
        },
        {
          type: 'error',
          msg: 'Usuário não cadastrado',
          valid: false
        }
      ]
      if (!this.$v.email.$invalid && this.email) return { type: 'success', valid: true }
      if (this.$v.email.$dirty && !this.$v.email.required) return validations[0]
      if (this.$v.email.$dirty && !this.$v.email.userExists) return validations[2]
      if ((this.$v.email.$dirty && this.$v.email.$invalid) || !this.$v.email.email) return validations[1]
      return {}
    },
    confirmationCodeValid () {
      return !this.$v.confirmationCode.$invalid
    },
    redefinePasswordButtonLabel () {
      if (this.expanded === 'redefine') return 'redefinir minha senha'
      return 'Recebi o código de redefinição'
    },
    redefinePasswordBtnDisabled () {
      return this.isRedefineStep && (this.$v.password.$invalid || this.$v.passwordConfirm.$invalid || this.$v.confirmationCode.$invalid || !this.id || this.sending)
    },
    askCodeBtnDisabled () {
      return this.isAskCodeStep && (this.$v.email.$invalid || this.sending)
    },
    isRedefineStep () {
      return this.expanded === 'redefine'
    },
    isAskCodeStep () {
      return this.expanded === 'code'
    }
  },
  created () {
    this.setInitialValues()
  },
  methods: {
    async redefinePassword () {
      if ((this.isRedefineStep && this.redefinePasswordBtnDisabled) || !this.isRedefineStep) return
      this.toggleShowLoading(true)
      this.sending = true
      try {
        const data = {
          code: this.confirmationCode,
          password: this.password
        }
        await this.$api.resetPassword(data, this.id)
        this.$router.push({ name: 'Home' })
          .then(() => this.$root.$emit('show-alert', 'success', 'Sua senha foi alterada'))
      } catch (err) {
        console.debug(err)
        this.$root.$emit('show-alert', 'warning', err.response.statusText)
      } finally {
        this.sending = false
        this.toggleShowLoading(false)
      }
    },
    async sendResetPasswordCode () {
      if ((this.isAskCodeStep && this.askCodeBtnDisabled) || !this.isAskCodeStep) return
      this.toggleShowLoading(true)
      this.sending = true
      try {
        const data = {
          email: this.email,
          ip: ip.address()
        }
        await this.$api.sendResetPasswordCode(data)
        this.setEmail('')
        this.$root.$emit('show-alert', 'success', 'Enviamos o código de alteração de senha para seu e-mail')
      } catch (err) {
        console.debug(err)
        this.$root.$emit('show-alert', 'warning', err.response.statusText)
      } finally {
        this.sending = false
        this.toggleShowLoading(false)
      }
    },
    setExpanded (value) {
      this.expanded = value
      if (this.isAskCodeStep && !this.askCodeBtnDisabled) return this.sendResetPasswordCode()
      if (this.isRedefineStep && !this.redefinePasswordBtnDisabled) return this.redefinePassword()
      this.resetData()
    },
    resetData () {
      this.id = ''
      this.sending = false
      this.setEmail('')
      this.setConfirmationCode('')
      this.setPassword('')
      this.redefinePassword('')
    },
    setConfirmationCode (value) {
      this.setDirty('confirmationCode')
      this.confirmationCode = value
    },
    setPasswordConfirm (value) {
      this.setDirty('passwordConfirm')
      this.passwordConfirm = value
    },
    setPassword (value) {
      this.setDirty('password')
      this.password = value
    },
    setEmail (value) {
      this.setDirty('email')
      this.email = value
    }
  }
}
</script>
