import { describe, expect, it } from 'vitest'
import {
  booruPayloadsFromState,
  cloudDataCollectionNames,
  customBlockListPayloadFromState,
  tagCollectionPayloadsFromState,
  tagCollectionsFromCloudRecords
} from '../../app/assets/js/PremiumCloudSync'

describe('Premium cloud sync policy', () => {
  it('sorts tag collection records from cloud by position', () => {
    expect(
      tagCollectionsFromCloudRecords([
        { id: 'second', user_id: 'user', name: 'Second', tags: ['two'], position: 2 },
        { id: 'first', user_id: 'user', name: 'First', tags: ['one'], position: 1 }
      ])
    ).toEqual([
      { name: 'First', tags: ['one'] },
      { name: 'Second', tags: ['two'] }
    ])
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
      { user_id: 'user-1', name: 'Animated', tags: ['animated'], position: 1 },
      { user_id: 'user-1', name: 'Favorites', tags: ['1girl', '-ai_generated'], position: 2 }
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
        position: 1
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
