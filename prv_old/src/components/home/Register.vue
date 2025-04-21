<template lang="pug">
  .container
    .card.rounded.semi-transparent
      .card-body
        .row
          .col-12
            h6 Para se cadastrar, preencha e envie o formulário abaixo:
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
                    auto-complete=omplete="new-email"
                  )
              .form-group
                .form-input
                  custom-input(
                    type="cpf"
                    :value="cpf"
                    :validation="cpfValidation"
                    @change="setCPF"
                    placeholder="CPF"
                  )
              .form-group
                .form-input
                  custom-input(
                    type="text"
                    :value="firstName"
                    :validation="firstnameValidation"
                    @change="setFirstName"
                    placeholder="Nome"
                  )
              .form-group
                .form-input
                  custom-input(
                    type="text"
                    :value="lastName"
                    :validation="lastnameValidation"
                    @change="setLastName"
                    placeholder="Sobrenome"
                  )
              .form-group
                .form-input
                  custom-input(
                    type="password"
                    :value="password"
                    :validation="passwordValidation"
                    @change="setPassword"
                    placeholder="Senha"
                    auto-complete="new-password"
                  )
              .form-group
                .form-input
                  custom-input(
                    type="password"
                    :value="passwordConfirm"
                    :validation="passwordConfirmValidation"
                    @change="setPasswordConfirm"
                    placeholder="Confirme a senha"
                    auto-complete="new-password-confirmation"
                  )
              .form-group
                .custom-control.custom-checkbox
                  input#term-agreement.custom-control-input(
                    type="checkbox"
                    v-model="termAgreement"
                  )
                  label.custom-control-label(
                    for='term-agreement'
                  )
                    | Li e concordo com os Termos de Uso
              .form-group.text-center.pt-3
                button.btn.btn-rounded.text-uppercase(
                  type="button"
                  :class="{ disabled: btnDisabled, 'btn-outline-secondary': btnDisabled, 'btn-primary': !btnDisabled }"
                  @click="submit"
                )
                  | Cadastrar
    .row.mt-4.pb-3
      .col-12.text-center
        .card.semi-transparent.rounded
          .card-body
            .small Já é cadastrado?
            a.text-blue(
              href=""
              @click.prevent="redirectTo('Home')"
            )
              | Clique aqui e acesse
</template>

<script>
import CustomInput from '@/components/commons/Input'
import { PROFILE } from '@/utils/constants'
import commons from '@/utils/mixins/commons'
import { isValid } from '@fnando/cpf'
import { required, email, helpers, minLength, sameAs, maxLength } from 'vuelidate/lib/validators'
import ip from 'ip'
import { DateTime } from 'luxon'

export default {
  name: 'Register',
  mixins: [commons],
  components: {
    CustomInput
  },
  data () {
    return {
      email: '',
      cpf: '',
      firstName: '',
      lastName: '',
      password: '',
      passwordConfirm: '',
      termAgreement: false,
      sending: false
    }
  },
  validations: {
    firstName: {
      required,
      maxLength: maxLength(25),
      alphaWhiteDiacritic: helpers.regex('alphaWhiteDiacritic', /^[A-Za-zÀ-ÖØ-öø-ÿ.\s]*$/),
      blackListName: value => !(/((^|\s)((teste|test)(s)?)(\s|$))/i.test(value))
    },
    lastName: {
      required,
      maxLength: maxLength(25),
      alphaWhiteDiacritic: helpers.regex('alphaWhiteDiacritic', /^[A-Za-zÀ-ÖØ-öø-ÿ.\s]*$/),
      blackListName: value => !(/((^|\s)((teste|test)(s)?)(\s|$))/i.test(value))
    },
    cpf: {
      required,
      cpfAvailable: async function (value) {
        if (!this.$v.cpf.cpfValidator || !this.$v.cpf.$dirty) return true
        try {
          await this.$api.cpfAvailable(value)
          return true
        } catch (err) {
          return false
        }
      },
      cpfValidator: value => isValid(value)
    },
    email: {
      required,
      emailAvailable: async function (value) {
        if (!this.$v.email.email || !this.$v.email.$dirty) return true
        try {
          await this.$api.emailAvailable(value)
          return true
        } catch (err) {
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
    }
  },
  computed: {
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
        },
        {
          type: 'error',
          msg: 'Informe uma senha com, no mínimo, 6 caracteres',
          valid: false
        }
      ]
      if (!this.$v.password.$invalid && this.password) return { type: 'success', valid: true }
      if (!this.$v.password.minLength && this.$v.password.$dirty) return validations[1]
      if (this.$v.password.$invalid && this.$v.password.$dirty) return validations[0]
      return {}
    },
    lastnameValidation () {
      const validations = [
        {
          type: 'error',
          msg: 'Informe seu sobrenome',
          valid: false
        },
        {
          type: 'error',
          msg: 'Tamanho máximo de 25 caracteres',
          valid: false
        }
      ]
      if (!this.$v.lastName.$invalid && this.lastName) return { type: 'success', valid: true }
      if (!this.$v.lastName.maxLength && this.$v.lastName.$dirty) return validations[1]
      if (this.$v.lastName.$invalid && this.$v.lastName.$dirty) return validations[0]
      return {}
    },
    firstnameValidation () {
      const validations = [
        {
          type: 'error',
          msg: 'Informe seu nome',
          valid: false
        },
        {
          type: 'error',
          msg: 'Tamanho máximo de 25 caracteres',
          valid: false
        }
      ]
      if (!this.$v.firstName.$invalid && this.firstName) return { type: 'success', valid: true }
      if (!this.$v.firstName.maxLength && this.$v.firstName.$dirty) return validations[1]
      if (this.$v.firstName.$invalid && this.$v.firstName.$dirty) return validations[0]
      return {}
    },
    cpfValidation () {
      const validations = [
        {
          type: 'error',
          msg: 'Informe o CPF',
          valid: false
        },
        {
          type: 'error',
          msg: 'CPF Inválido',
          valid: false
        },
        {
          msg: 'Verificando CPF...'
        },
        {
          type: 'error',
          msg: 'Este CPF já está cadastrado',
          valid: false
        }
      ]
      if (!this.$v.cpf.$invalid && this.cpf) return { type: 'success', valid: true }
      if (this.$v.cpf.$invalid && this.$v.cpf.$dirty) {
        if (!this.$v.cpf.required) return validations[0]
        if (!this.$v.cpf.cpfAvailable && !this.$v.cpf.$pending) return validations[3]
        if (!this.$v.cpf.cpfValidator && this.$v.cpf.required) return validations[1]
        if (this.$v.cpf.cpfValidator && this.$v.cpf.$pending) return validations[2]
      }
      return {}
    },
    emailValidation () {
      const validations = [
        {
          type: 'error',
          msg: 'Informe seu e-mail',
          valid: false
        },
        {
          type: 'error',
          msg: 'Por favor, insira um e-mail válido',
          valid: false
        },
        {
          type: 'error',
          msg: 'Este e-mail já está cadastrado',
          valid: false
        },
        {
          msg: 'Verificando e-mail...'
        }
      ]
      if (!this.$v.email.$invalid && this.email) return { type: 'success', valid: true }
      if (this.$v.email.$dirty && !this.$v.email.required) return validations[0]
      if (this.$v.email.email && !this.$v.email.$pending && !this.$v.email.emailAvailable) return validations[2]
      if (this.email.$pending) return validations[3]
      if ((this.$v.email.$dirty && this.$v.email.$invalid) || !this.$v.email.email) return validations[1]
      return {}
    },
    btnDisabled () {
      return this.$v.$invalid || !this.termAgreement || this.sending
    }
  },
  created () {
    this.setInitialValues()
  },
  methods: {
    async submit () {
      this.$root.$emit('hide-alert')
      if (this.btnDisabled) return
      this.toggleShowLoading(true)
      this.sending = true
      try {
        const sendData = {
          email: this.email,
          password: this.password,
          username: this.cpf,
          first_name: this.firstName,
          last_name: this.lastName,
          user_level: PROFILE,
          IP: ip.address(),
          joined: Math.trunc(DateTime.local().toSeconds()),
          joined_date: DateTime.local().toFormat('MM-yyyy')
        }
        const res = await this.$api.createUser(sendData)
        if (res.status !== 201) throw res
        this.$router.push({ name: 'Home' })
          .then(() => this.$root.$emit('show-alert', 'success', 'Sua conta foi criada. Você já pode acessar o app :)'))
          .catch(() => {})
      } catch (err) {
        console.debug(err)
        this.$root.$emit('show-alert', 'warning', err.response.statusText)
      } finally {
        this.sending = false
        this.toggleShowLoading(false)
      }
    },
    setPasswordConfirm (value) {
      this.setDirty('passwordConfirm')
      this.passwordConfirm = value
    },
    setPassword (value) {
      this.setDirty('password')
      this.password = value
    },
    setLastName (value) {
      this.setDirty('lastName')
      this.lastName = value
    },
    setFirstName (value) {
      this.setDirty('firstName')
      this.firstName = value
    },
    setCPF (value) {
      this.setDirty('cpf')
      this.cpf = value
    },
    setEmail (value) {
      this.setDirty('email')
      this.email = value
    }
  }
}
</script>
