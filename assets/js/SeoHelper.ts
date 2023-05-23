import Tag from 'assets/js/tag.dto'

export function tagArrayToTitle(tags: Tag[]) {
  if (!tags.length) {
    return null
  }

  return (
    tags
      .map((tag) => tag.name)
      // .map((tag) => capitalize(tag))
      .map((tag) => normalizeStringForTitle(tag))
      .join(', ')
  )
}

export function normalizeStringForTitle(string: string) {
  if (!string) {
    return null
  }

  string = string.trim()

  // Delete negative tag
  if (string.startsWith('-')) {
    return null
  }

  // Replace underscores with spaces
  string = string.replace(/_/g, ' ')

  // Delete parentheses
  string = string.replace(/\(/g, '')
  string = string.replace(/\)/g, '')

  // Delete colons
  string = string.replace(/:/g, '')

  return string
}
