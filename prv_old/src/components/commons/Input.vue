<template >
  <label>
    <the-mask
      v-if="type === 'cpf'"
      :class="{
        'input--error': validation.type === 'error',
        'input--success': validation.type === 'success',
      }"
      type="tel"
      v-model="valueInput"
      :value="valueInput"
      :mask="['###.###.###-##']"
      @input="onInput($event)"
      @focus="onFocus($event.target.value)"
      required="required"
      :autocomplete="autoComplete"
      :readonly="readonly"
    ></the-mask>
    <the-mask
      v-else-if="type === 'mask'"
      :class="{
        'input--error': validation.type === 'error',
        'input--success': validation.type === 'success',
      }"
      type="tel"
      v-model="valueInput"
      :value="valueInput"
      :mask="mask"
      @input="onInput($event)"
      @focus="onFocus($event.target.value)"
      required="required"
      :autocomplete="autoComplete"
      :readonly="readonly"
    ></the-mask
    ><input
      v-else
      :class="[
        {
          'input--error': validation.type === 'error',
          'input--success': validation.type === 'success',
        },
        className,
      ]"
      :type="type"
      v-model="valueInput"
      :value="valueInput"
      @input="onInput($event.target.value)"
      @focus="onFocus($event.target.value)"
      required="required"
      :autocomplete="autoComplete"
      :readonly="readonly"
    /><span class="placeholder"
      >{{ placeholder }}<i v-if="icon" :class="icon"></i
    ></span>
    <div
      class="validation-msg"
      v-if="validation.msg"
      :class="{
        'validation-msg--error': validation.type === 'error',
        'validation-msg--success': validation.type === 'success',
      }"
    >
      <span class="text-wrap">{{ validation.msg }}</span>
    </div>
  </label>
</template>

<script>
export default {
  name: 'Input',
  props: {
    className: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: ''
    },
    mask: {
      type: Array,
      default: () => []
    },
    value: {
      default: ''
    },
    placeholder: {
      default: ''
    },
    icon: {
      default: ''
    },
    autoComplete: {
      type: String,
      default: ''
    },
    readonly: {
      type: Boolean,
      default: false
    },
    validation: {
      type: Object,
      default: () => {
        return {
          type: 'default',
          msg: null,
          valid: null
        }
      }
    }
  },
  data () {
    return {
      valueInput: this.value,
      filled: false
    }
  },
  watch: {
    value (oldValue, newValue) {
      if (oldValue !== newValue) {
        this.valueInput = oldValue
        this.onInput(this.valueInput)
      }
    }
  },
  created () {
    if (this.value) this.filled = true
  },
  updated () {
    if (this.value) this.filled = true
  },
  methods: {
    onInput (value) {
      value !== '' ? (this.filled = true) : (this.filled = false)
      this.$emit('change', value?.trim())
    },
    onFocus (value) {
      this.$emit('focus', value)
    }
  }
}
</script>
