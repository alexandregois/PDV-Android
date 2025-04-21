<template>
    <div class="selecter">
        <div class="selecter-container">
            <div class="selecter-left">
                <div class="selecter-stage">
                    <div class="selecter-selector">
                        <div :class="{ disabled: this.counterIsEqualToLowerBoundary }" @click="increment(-1)"><i class="fas fa-minus"></i></div>
                    </div>
                </div>
            </div>
            <div class="selecter-center">
                <div class="selecter-stage">
                    <h3>{{ counter | pluralize(label.singular, label.plural, true) }}</h3>
                </div>
            </div>
            <div class="selecter-right">
                <div class="selecter-stage">
                    <div class="selecter-selector">
                        <div :class="{ disabled: this.counterIsEqualToUpperBoundary }" @click="increment(1)"><i class="fas fa-plus"></i></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { inRange, clamp } from 'lodash'

export default {
  name: 'Selecter',
  props: {
    initialValue: {
      type: Number,
      default: 0
    },
    label: {
      type: Object,
      default: () => {}
    },
    boundaries: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      counter: 0
    }
  },
  computed: {
    counterIsEqualToUpperBoundary () {
      return this.counter === this.upper || this.upper < this.lower
    },
    counterIsEqualToLowerBoundary () {
      return this.counter === this.lower
    },
    lower () {
      if (this.boundaries?.lower) return this.boundaries.lower
      return 0
    },
    upper () {
      if (this.boundaries?.upper) return this.boundaries.upper
      return 0
    }
  },
  created () {
    this.counter = this.initialValue
    this.$parent.$on('period-reset', () => {
      this.counter = this.initialValue
    })
  },
  watch: {
    counter (value) {
      if (!inRange(value, this.lower, this.upper + 1)) this.counter = clamp(value, this.lower, this.upper)
      this.$emit('change', this.counter)
    }
  },
  methods: {
    increment (factor) {
      this.counter += factor
    }
  }
}
</script>

