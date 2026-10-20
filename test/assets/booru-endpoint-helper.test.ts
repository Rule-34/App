import { describe, expect, it } from 'vitest'
import { resolveBooruApiEndpoint } from '../../app/assets/js/BooruEndpointHelper'

describe('resolveBooruApiEndpoint', () => {
  it('sends rule34.xxx requests to its API host', () => {
    expect(resolveBooruApiEndpoint('rule34.xxx')).toBe('api.rule34.xxx')
  })

  it('leaves every other booru domain untouched', () => {
    expect(resolveBooruApiEndpoint('gelbooru.com')).toBe('gelbooru.com')
    expect(resolveBooruApiEndpoint('rule34.paheal.net')).toBe('rule34.paheal.net')
    expect(resolveBooruApiEndpoint('e621.net')).toBe('e621.net')
  })
})
