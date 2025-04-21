import { APP_TITLE } from '@/utils/constants'
import { Plugins } from '@capacitor/core'
import { filter } from 'lodash'

export default {
  data () {
    return {
      showLoading: false,
      initialValues: {}
    }
  },
  computed: {
    fieldsKeys () {
      if (!this.$v) return []
      return filter(Object.keys(this.$v), key => key.indexOf('$') === -1)
    },
    appName () {
      return APP_TITLE
    }
  },
  beforeCreate () {
    this.$root.$emit('show-loading', true)
  },
  created () {
    this.$root.$on('show-loading', state => {
      this.showLoading = state
    })
  },
  mounted () {
    this.$root.$emit('show-loading', false)
  },
  methods: {
    showAlert (title, message, buttonTitle) {
      Plugins.Modals.alert({
        title,
        message,
        buttonTitle: buttonTitle || 'OK'
      })
    },
    lockBody (overflow) {
      const body = document.body
      body.style.overflowY = overflow
    },
    toggleShowLoading (state) {
      this.$root.$emit('show-loading', state)
    },
    dispatchShowModal (component, params, callBefore) {
      if (typeof callBefore === 'function') callBefore()
      this.$root.$emit('show-modal', component, params)
    },
    redirectTo (destination, callback, callBefore) {
      if (typeof callBefore === 'function') callBefore()
      this.$router.push({ name: destination })
        .then(() => {
          if (typeof callback === 'function') callback()
        })
        .catch(() => this.$root.$emit('toggle-menu', false))
    },
    setInitialValues () {
      if (!this.$v) return
      this.fieldsKeys.forEach(key => {
        Object.assign(this.initialValues, { [key]: this.$v[key].$model })
        this.$v[key].$reset()
      })
    },
    openAutocomplete (field) {
      const value = this[field]
      return value && this.$v[field].$dirty && this[field] !== this.initialValues[field]
    },
    async setDirty (field) {
      const value = this[field]
      if (!value.toString() || value.toString() === this.initialValues[field].toString()) return this.$v[field].$reset()
      this.$v[field].$touch()
    },
    async scrollTop () {
      document.getElementsByClassName('custom-modal-content')[0].scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
}
