import { describe, expect, it } from 'vitest'
import {
  booruPayloadsFromState,
  cloudDataCollectionNames,
  createLatestAsyncQueue,
  customBlockListPayloadFromState,
  tagCollectionPayloadsFromState,
  tagCollectionsFromCloudRecords
} from '../../app/repositories/PremiumCloudRepository'

function deferred() {
  let resolve!: () => void
  let reject!: (error: unknown) => void
  const promise = new Promise<void>((done, fail) => {
    resolve = done
    reject = fail
  })

  return { promise, resolve, reject }
}

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

  it('targets saved posts plus all premium sync collections for cloud data deletion', () => {
    expect(cloudDataCollectionNames).toEqual(['posts', 'tag_collections', 'boorus', 'tag_blocklists'])
  })
})

describe('Premium cloud sync save queue', () => {
  it('resolves when the latest queued payload succeeds after an older save fails', async () => {
    const firstSave = deferred()
    const savedPayloads: string[] = []
    const queue = createLatestAsyncQueue(async (payload: string) => {
      savedPayloads.push(payload)

      if (payload === 'first') {
        await firstSave.promise
      }
    })

    const first = queue('first')
    const second = queue('second')
    const third = queue('third')

    await Promise.resolve()

    expect(savedPayloads).toEqual(['first'])

    firstSave.reject(new Error('Network failed'))
    await expect(Promise.all([first, second, third])).resolves.toEqual([undefined, undefined, undefined])

    expect(savedPayloads).toEqual(['first', 'third'])
  })

  it('lets callers invalidate stale in-flight mutations before they update local state', async () => {
    const firstSave = deferred()
    const localState: string[] = []
    const queue = createLatestAsyncQueue<string>(async (payload, isCurrent) => {
      if (!isCurrent()) {
        return
      }

      await firstSave.promise

      if (!isCurrent()) {
        return
      }

      localState.push(payload)
    })

    const first = queue('first')

    await Promise.resolve()
    queue.invalidate()
    firstSave.resolve()
    await first

    expect(localState).toEqual([])
  })
})
