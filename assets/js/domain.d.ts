import type { BooruTypeObj } from '~/assets/lib/rule-34-shared-resources/src/util/BooruUtils'

export interface Domain {
  domain: string

  type: BooruTypeObj

  config: Record<string, unknown> | null

  isPremium: boolean
}
