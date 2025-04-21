import {
  DATE_BR,
  DATE_TIME_WITHOUT_SECONDS,
  PARKING_LIMIT
} from '@/utils/constants'
import { truncate, padStart } from 'lodash'
import { DateTime } from 'luxon'
import VueFiltersAutoImport from 'vuefiltersautoimport'

class Filter extends VueFiltersAutoImport {
  constructor () {
    super(Filter.prototype)
  }

  formatGetnetValue (value) {
    const valueAsCents = parseFloat(value).toFixed(2) * 100
    return padStart(valueAsCents.toFixed(0).toString(), 12, '0')
  }

  parkingHours (value) {
    if (!value) return ''
    return value.toFormat(PARKING_LIMIT)
  }

  date (value) {
    return DateTime.fromISO(value).toFormat(DATE_BR)
  }

  periodToBR (value) {
    return DateTime.fromISO(value).toFormat(DATE_TIME_WITHOUT_SECONDS)
  }

  money (value) {
    return (+value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  pluralize (value, singular, plural, showValue) {
    if (value === 1) return showValue ? `${value} ${singular}` : singular
    return showValue ? `${value} ${plural}` : plural
  }

  truncateString (value, length) {
    return truncate(value, { length })
  }
}

export default new Filter()
