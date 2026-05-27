import { describe, expect, it } from 'vitest'
import {
  booruPayloadsFromState,
  cloudDataCollectionNames,
  customBlockListPayloadFromState,
  resolveCloudRefreshFeatureState,
  resolveInitialFeatureState,
  tagCollectionPayloadsFromState,
  tagCollectionsFromCloudRecords
} from '../../app/assets/js/PremiumCloudSync'

describe('Premium cloud sync policy', () => {
  it('keeps local state and skips subscriptions when cloud is empty', () => {
    const localState = [{ name: 'Animated', tags: ['animated'] }]

    const result = resolveInitialFeatureState([], localState, () => [{ name: 'Cloud', tags: ['cloud'] }])

    expect(result).toEqual({
      source: 'local',
      state: localState,
      shouldSubscribe: false
    })
  })

  it('uses cloud state and enables subscriptions when cloud records exist', () => {
    const result = resolveInitialFeatureState(
      [
        { id: 'second', user_id: 'user', name: 'Second', tags: ['two'], position: 2 },
        { id: 'first', user_id: 'user', name: 'First', tags: ['one'], position: 1 }
      ],
      [{ name: 'Local', tags: ['local'] }],
      tagCollectionsFromCloudRecords
    )

    expect(result).toEqual({
      source: 'cloud',
      state: [
        { name: 'First', tags: ['one'] },
        { name: 'Second', tags: ['two'] }
      ],
      shouldSubscribe: true
    })
  })

  it('applies an empty refresh only after that feature was previously cloud-backed', () => {
    expect(
      resolveCloudRefreshFeatureState({ source: 'local', state: [], shouldSubscribe: false }, true, [
        { name: 'Local default', tags: ['local'] }
      ])
    ).toEqual({
      shouldApply: true,
      cloudBacked: false,
      state: [{ name: 'Local default', tags: ['local'] }]
    })

    expect(
      resolveCloudRefreshFeatureState({ source: 'local', state: [], shouldSubscribe: false }, false, [
        { name: 'Local default', tags: ['local'] }
      ])
    ).toEqual({
      shouldApply: false,
      cloudBacked: false,
      state: [{ name: 'Local default', tags: ['local'] }]
    })
  })
})

describe('Premium cloud sync payloads', () => {
  it('serializes the full visible tag collection list after a user edit', () => {
    expect(
      tagCollectionPayloadsFromState('user-1', [
        { name: 'Animated', tags: ['animated'] },
        { name: 'Favorites', tags: ['1girl', '-ai_generated'] }
      ])
    ).toEqual([
      { user_id: 'user-1', name: 'Animated', tags: ['animated'], position: 0 },
      { user_id: 'user-1', name: 'Favorites', tags: ['1girl', '-ai_generated'], position: 1 }
    ])
  })

  it('serializes custom boorus without default booru records', () => {
    expect(
      booruPayloadsFromState('user-1', [
        {
          domain: 'custom.example',
          type: { type: 'gelbooru', initialPageID: 0, posts: true, singlePost: true, tags: true, random: true },
          config: { options: { HTTPScheme: 'https' } },
          isPremium: true,
          isCustom: true
        }
      ])
    ).toEqual([
      {
        user_id: 'user-1',
        domain: 'custom.example',
        type: 'gelbooru',
        config: { options: { HTTPScheme: 'https' } },
        position: 0
      }
    ])
  })

  it('stores only the one editable custom blocklist as a per-user record', () => {
    expect(customBlockListPayloadFromState('user-1', ['loli', 'ai_generated'])).toEqual({
      user_id: 'user-1',
      tags: ['loli', 'ai_generated']
    })
  })

  it('targets saved posts plus all critical sync collections for cloud data deletion', () => {
    expect(cloudDataCollectionNames).toEqual(['posts', 'tag_collections', 'boorus', 'tag_blocklists'])
  })
})
