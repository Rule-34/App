import Tag from 'assets/js/tag.dto'

export function tagArrayToTitle(tags: Tag[]) {
  if (!tags.length) {
    return null
  }

  const cleanedTags = tags
    //
    .map((tag) => tag.name)
    //
    .map((tag) => normalizeStringForTitle(tag))

  const tagsThatStartWithNothing = cleanedTags.filter((tag) => !tag.startsWith('-'))

  const tagsThatStartWithMinus = cleanedTags
    //
    .filter((tag) => tag.startsWith('-'))
    .map((tag) => tag.replace('-', ''))

  let title = ''

  if (tagsThatStartWithNothing.length) {
    title += `with ${tagsThatStartWithNothing.join(', ')}`
  }

  if (tagsThatStartWithNothing.length && tagsThatStartWithMinus.length) {
    title += ', and'
  }

  if (tagsThatStartWithMinus.length) {
    title += ` without ${tagsThatStartWithMinus.join(', ')}`
  }

  return title
}

export function normalizeStringForTitle(string: string) {
  if (!string) {
    return null
  }

  string = string.trim()

  // Replace underscores with spaces
  string = string.replace(/_/g, ' ')

  // Delete parentheses
  string = string.replace(/\(/g, '')
  string = string.replace(/\)/g, '')

  // Delete colons
  string = string.replace(/:/g, '')

  return string
}
