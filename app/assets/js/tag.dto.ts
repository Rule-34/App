import type { IPostTags } from './post.dto'

export interface ITag {
  name: string
  type?: keyof IPostTags
  count?: number
}

// For default values
export class TagDTO implements ITag {
  name: ITag['name'] = ''
  type?: ITag['type']
  count?: ITag['count']

  toJSON() {
    return { ...this }
  }
}

export default class Tag extends TagDTO {
  constructor(dto: ITag) {
    super()
    Object.assign(this, dto)
  }
}

/**
 * Adds the tag to the selection, or removes it when it is already selected.
 *
 * A tag can not be both selected and excluded, so adding one form drops its
 * counterpart: `solo` and `-solo` never end up selected together.
 */
export function toggleSelectedTag(tags: readonly Tag[], tag: string): Tag[] {
  if (tags.some((selectedTag) => selectedTag.name === tag)) {
    return tags.filter((selectedTag) => selectedTag.name !== tag)
  }

  const counterpartTag = tag.startsWith('-') ? tag.slice(1) : `-${tag}`
  const remainingTags = tags.filter((selectedTag) => selectedTag.name !== counterpartTag)

  return [...remainingTags, new Tag({ name: tag }).toJSON()]
}
