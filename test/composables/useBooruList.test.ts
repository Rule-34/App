import { describe, expect, it } from 'vitest'
import {
  completeBooruList,
  defaultBooruList as sharedDefaultBoorus
} from '../../app/assets/lib/rule-34-shared-resources/src/util/BooruUtils'
import { defaultBooruList } from '../../app/composables/useBooruList'

describe('useBooruList', () => {
  it('preserves the curated manual order from completeBooruList without sorting', () => {
    const disabledDomains = ['realbooru.com', 'konachan.com', 'booru.allthefallen.moe', 'sakugabooru.com']

    const expectedDomains = completeBooruList.filter((b) => !disabledDomains.includes(b.domain)).map((b) => b.domain)

    const actualDomains = defaultBooruList.map((b) => b.domain)
    expect(actualDomains).toEqual(expectedDomains)
  })

  it('determines free/premium status from sharedDefaultBoorus membership', () => {
    const freeDomainsFromShared = sharedDefaultBoorus.map((b) => b.domain)

    for (const booru of defaultBooruList) {
      if (freeDomainsFromShared.includes(booru.domain)) {
        expect(booru.isPremium, `${booru.domain} should be free`).toBe(false)
      } else {
        expect(booru.isPremium, `${booru.domain} should be premium`).toBe(true)
      }
    }
  })

  it('classifies danbooru.donmai.us as free', () => {
    const danbooru = defaultBooruList.find((b) => b.domain === 'danbooru.donmai.us')
    expect(danbooru).toBeDefined()
    expect(danbooru?.isPremium).toBe(false)
  })

  it('classifies gelbooru.com as premium', () => {
    const gelbooru = defaultBooruList.find((b) => b.domain === 'gelbooru.com')
    expect(gelbooru).toBeDefined()
    expect(gelbooru?.isPremium).toBe(true)
  })

  it('filters out disabled booru domains', () => {
    const disabled = ['realbooru.com', 'konachan.com', 'booru.allthefallen.moe', 'sakugabooru.com']
    for (const domain of disabled) {
      expect(defaultBooruList.some((b) => b.domain === domain)).toBe(false)
    }
  })
})
