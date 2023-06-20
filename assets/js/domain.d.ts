import type { BooruTypeObj } from 'assets/lib/rule-34-shared-resources/src/util/BooruUtils'

export interface Domain {
  domain: string

  type: BooruTypeObj

  description: Description

  disabled: boolean
}

export interface Description {
  posts_count: number
  tag_system: number
  post_moderation: number
  content_variety: number
  load_speed: number
  api_compatibility: number

  score: number

  note?: string
}
