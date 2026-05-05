import type Tag from '~/assets/js/tag.dto'
import { normalizeStringForTitle } from '~/assets/js/SeoHelper'

/**
 * Composable that builds a locale-aware tag-based title string.
 * Automatically uses the current i18n locale for connectors
 * ("with", "and", "without") via `seoHelper.*` translation keys.
 *
 * Usage:
 *   const buildTagTitle = useTagTitle()
 *   const title = buildTagTitle(tags) // => "Cat, Dog without Mouse" | null
 */
export function useTagTitle() {
  const { t } = useI18n()

  return function buildTitle(tags: Tag[]): string | null {
    if (!tags.length) {
      return null
    }

    const cleanedTags: string[] = tags
      .map((tag) => tag.name)
      .map((tag) => normalizeStringForTitle(tag))
      .filter((tag): tag is string => tag != null)

    if (!cleanedTags.length) {
      return null
    }

    const positive = cleanedTags.filter((tag) => !tag.startsWith('-'))

    const negative = cleanedTags
      .filter((tag) => tag.startsWith('-'))
      .map((tag) => tag.slice(1))

    let title = ''

    if (positive.length) {
      title += positive.join(', ')
    }

    if (negative.length) {
      title += t('seoHelper.without')
      title += negative.join(', ')
    }

    return title.trim() || null
  }
}
