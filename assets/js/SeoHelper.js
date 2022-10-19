'use strict'

import { capitalize } from 'lodash-es'

export class SeoHelper {
  static tagArrayToTitle(tags) {
    if (!tags) {
      return null
    }

    return tags
      .map((tag) => capitalize(tag))
      .map((tag) => SeoHelper.normalizeStringForTitle(tag))
      .join(', ')
  }

  static normalizeStringForTitle(string) {
    if (!string) {
      return null
    }

    string = string.trim()

    // Delete first negative tag (minus)
    string = string.startsWith('-') ? string.substr(1) : string

    // Replace underscores with spaces
    string = string.replace(/_/g, ' ')

    // Delete parentheses
    string = string.replace(/\(/g, '')
    string = string.replace(/\)/g, '')

    // Delete colons
    string = string.replace(/:/g, '')

    return string
  }
}
