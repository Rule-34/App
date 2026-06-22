import type { IRenderablePost } from './post.dto'

function hasAnyBlockedTag(tags: readonly string[], blockedTags: ReadonlySet<string>): boolean {
  return tags.some((tag) => blockedTags.has(tag))
}

export function postHasBlockedTag(post: IRenderablePost, blockedTags: ReadonlySet<string>): boolean {
  if (blockedTags.size === 0) {
    return false
  }

  return (
    hasAnyBlockedTag(post.tags.meta, blockedTags) ||
    hasAnyBlockedTag(post.tags.general, blockedTags) ||
    hasAnyBlockedTag(post.tags.artist, blockedTags) ||
    hasAnyBlockedTag(post.tags.character, blockedTags) ||
    hasAnyBlockedTag(post.tags.copyright, blockedTags)
  )
}
