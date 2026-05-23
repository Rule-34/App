import { lowerCase, startCase } from 'es-toolkit'

export function normalizeStringForTitle(string: string): string | null {
  if (!string) {
    return null
  }

  let startsWithMinus = false

  if (string.startsWith('-')) {
    startsWithMinus = true
    string = string.slice(1)
  }

  if (!string.trim()) {
    return null
  }

  // Capitalize first letter of each word - https://stackoverflow.com/questions/38084396/lodash-title-case-uppercase-first-letter-of-every-word
  string = startCase(lowerCase(string))

  if (startsWithMinus) {
    string = '-' + string
  }

  return string
}
