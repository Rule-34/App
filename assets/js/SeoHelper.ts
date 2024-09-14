import Tag from '~/assets/js/tag.dto'
import { startCase, toLower } from 'lodash-es'

export function tagArrayToTitle(tags: Tag[], addWith: boolean = true, addWithout: boolean = true) {
  if (!tags.length) {
    return null
  }

  const cleanedTags: string[] = tags
    //
    .map((tag) => tag.name)
    //
    .map((tag) => normalizeStringForTitle(tag))
    // Remove null
    .filter((tag) => tag != null)

  const tagsThatStartWithNothing = cleanedTags.filter((tag) => !tag.startsWith('-'))

  const tagsThatStartWithMinus = cleanedTags
    //
    .filter((tag) => tag.startsWith('-'))
    .map((tag) => tag.replace('-', ''))

  let title = ''

  if (tagsThatStartWithNothing.length) {
    if (addWith) {
      title += 'with '
    }

    title += tagsThatStartWithNothing.join(', ')
  }

  if (addWith && addWithout && tagsThatStartWithNothing.length && tagsThatStartWithMinus.length) {
    title += ', and'
  }

  if (tagsThatStartWithMinus.length) {
    if (addWithout) {
      title += ' without '
    }

    title += tagsThatStartWithMinus.join(', ')
  }

  return title
}

export function normalizeStringForTitle(string: string) {
  if (!string) {
    return null
  }

  let startsWithMinus = false

  if (string.startsWith('-')) {
    startsWithMinus = true
  }

  // Capitalize first letter of each word - https://stackoverflow.com/questions/38084396/lodash-title-case-uppercase-first-letter-of-every-word
  string = startCase(toLower(string))

  if (startsWithMinus) {
    string = '-' + string
  }

  return string
}
