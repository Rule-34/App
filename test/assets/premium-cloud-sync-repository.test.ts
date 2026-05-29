import { describe, expect, it, vi } from 'vitest'
import { PremiumCloudSyncRepository } from '../../app/assets/js/PremiumCloudSync'

type FakeRecord = { id: string; [key: string]: unknown }

function createFakePocketBase(initialRecords: Record<string, FakeRecord[]>) {
  const records = structuredClone(initialRecords)
  const calls: Array<{ collection: string; method: string; args: unknown[] }> = []
  const subscribers: Record<string, Array<(event?: unknown) => unknown>> = {}

  return {
    calls,
    subscribers,
    client: {
      authStore: {
        isValid: true,
        record: { id: 'user-1' }
      },
      collection(name: string) {
        records[name] ??= []

        return {
          getFullList: vi.fn(async (...args: unknown[]) => {
            calls.push({ collection: name, method: 'getFullList', args })
            return records[name]
          }),
          create: vi.fn(async (payload: Record<string, unknown>) => {
            calls.push({ collection: name, method: 'create', args: [payload] })
            const record = { id: `${name}-${records[name].length + 1}`, ...payload }
            records[name].push(record)
            return record
          }),
          update: vi.fn(async (id: string, payload: Record<string, unknown>) => {
            calls.push({ collection: name, method: 'update', args: [id, payload] })
            const index = records[name].findIndex((record) => record.id === id)

            if (index === -1) {
              throw new Error(`Record not found: ${id}`)
            }

            records[name][index] = { ...records[name][index], ...payload }
            return records[name][index]
          }),
          delete: vi.fn(async (id: string) => {
            calls.push({ collection: name, method: 'delete', args: [id] })
            records[name] = records[name].filter((record) => record.id !== id)
            return true
          }),
          subscribe: vi.fn(async (topic: string, callback: (event?: unknown) => unknown) => {
            calls.push({ collection: name, method: 'subscribe', args: [topic] })
            subscribers[name] ??= []
            subscribers[name].push(callback)

            return async () => {
              calls.push({ collection: name, method: 'unsubscribe', args: [topic] })
            }
          })
        }
      },
      createBatch() {
        return {
          collection(name: string) {
            return {
              create(payload: Record<string, unknown>) {
                calls.push({ collection: name, method: 'batch.create', args: [payload] })
              },
              update(id: string, payload: Record<string, unknown>) {
                calls.push({ collection: name, method: 'batch.update', args: [id, payload] })
              },
              delete(id: string) {
                calls.push({ collection: name, method: 'batch.delete', args: [id] })
              }
            }
          },
          send: vi.fn(async () => {
            calls.push({ collection: '__batch__', method: 'send', args: [] })
            return []
          })
        }
      }
    }
  }
}

describe('PremiumCloudSyncRepository', () => {
  it('does not write anything while loading empty cloud state', async () => {
    const { client, calls } = createFakePocketBase({
      posts: [],
      tag_collections: [],
      boorus: [],
      tag_blocklists: []
    })
    const repository = new PremiumCloudSyncRepository(client)

    const state = await repository.loadPremiumCloudState()

    expect(state).toEqual({
      savedPosts: [],
      tagCollections: [],
      boorus: [],
      blockList: []
    })
    expect(calls).toEqual([
      {
        collection: 'posts',
        method: 'getFullList',
        args: [{ fields: 'id, original_id, original_domain', filter: 'user_id = "user-1"' }]
      },
      {
        collection: 'tag_collections',
        method: 'getFullList',
        args: [{ filter: 'user_id = "user-1"', sort: 'position' }]
      },
      {
        collection: 'boorus',
        method: 'getFullList',
        args: [{ filter: 'user_id = "user-1"', sort: 'position' }]
      },
      {
        collection: 'tag_blocklists',
        method: 'getFullList',
        args: [{ filter: 'user_id = "user-1"' }]
      }
    ])
  })

  it('loads saved post summaries from the user-scoped posts collection', async () => {
    const { client, calls } = createFakePocketBase({
      posts: [
        { id: 'saved-post-1', user_id: 'user-1', original_id: 34, original_domain: 'rule34.xxx' },
        { id: 'saved-post-2', user_id: 'user-1', original_id: 35, original_domain: 'gelbooru.com' }
      ],
      tag_collections: [],
      boorus: [],
      tag_blocklists: []
    })
    const repository = new PremiumCloudSyncRepository(client)

    const state = await repository.loadPremiumCloudState()

    expect(state.savedPosts).toEqual([
      { id: 'saved-post-1', original_id: 34, original_domain: 'rule34.xxx' },
      { id: 'saved-post-2', original_id: 35, original_domain: 'gelbooru.com' }
    ])
    expect(calls[0]).toEqual({
      collection: 'posts',
      method: 'getFullList',
      args: [{ fields: 'id, original_id, original_domain', filter: 'user_id = "user-1"' }]
    })
  })

  it('creates saved posts through the premium repository and returns the saved summary', async () => {
    const { client, calls } = createFakePocketBase({
      posts: []
    })
    const repository = new PremiumCloudSyncRepository(client)

    const savedPost = await repository.savePost({
      id: 34,
      domain: 'rule34.xxx',
      high_res_file: { url: 'https://img.example/high.jpg', width: 100, height: 100 },
      low_res_file: { url: null, width: null, height: null },
      preview_file: { url: 'https://img.example/preview.jpg', width: 50, height: 50 },
      tags: { artist: ['artist'], character: [], copyright: [], general: ['tag'], meta: [] },
      score: 10,
      sources: ['https://source.example'],
      rating: 'explicit',
      media_type: 'image'
    })

    expect(savedPost).toEqual({
      id: 'posts-1',
      original_id: 34,
      original_domain: 'rule34.xxx'
    })
    expect(calls).toContainEqual({
      collection: 'posts',
      method: 'create',
      args: [
        expect.objectContaining({
          user_id: 'user-1',
          original_id: 34,
          original_domain: 'rule34.xxx',
          high_res_file: 'https://img.example/high.jpg'
        })
      ]
    })
  })

  it('deletes saved posts through the premium repository', async () => {
    const { client, calls } = createFakePocketBase({
      posts: [{ id: 'saved-post-1', user_id: 'user-1', original_id: 34, original_domain: 'rule34.xxx' }]
    })
    const repository = new PremiumCloudSyncRepository(client)

    await repository.deleteSavedPost('saved-post-1')

    expect(calls).toContainEqual({ collection: 'posts', method: 'delete', args: ['saved-post-1'] })
  })

  it('creates a custom blocklist record only when explicitly saved', async () => {
    const { client, calls } = createFakePocketBase({
      tag_blocklists: []
    })
    const repository = new PremiumCloudSyncRepository(client)

    await repository.saveCustomBlockList(['loli'])

    expect(calls).toContainEqual({
      collection: 'tag_blocklists',
      method: 'create',
      args: [{ user_id: 'user-1', tags: ['loli'] }]
    })
  })

  it('updates an existing custom blocklist record instead of creating another one', async () => {
    const { client, calls } = createFakePocketBase({
      tag_blocklists: [{ id: 'blocklist', user_id: 'user-1', tags: ['old'] }]
    })
    const repository = new PremiumCloudSyncRepository(client)

    await repository.saveCustomBlockList(['loli'])

    expect(calls.filter((call) => call.method !== 'getFullList')).toEqual([
      {
        collection: 'tag_blocklists',
        method: 'update',
        args: ['blocklist', { user_id: 'user-1', tags: ['loli'] }]
      }
    ])
  })

  it('updates existing positioned tag collection records when names change', async () => {
    const { client, calls } = createFakePocketBase({
      tag_collections: [{ id: 'collection', user_id: 'user-1', name: 'Old', tags: ['old'], position: 0 }]
    })
    const repository = new PremiumCloudSyncRepository(client)

    await repository.saveTagCollections([{ name: 'New', tags: ['new'] }])

    expect(calls.filter((call) => call.method !== 'getFullList')).toEqual([
      {
        collection: 'tag_collections',
        method: 'update',
        args: ['collection', { user_id: 'user-1', name: 'New', tags: ['new'], position: 1 }]
      }
    ])
  })

  it('does not update unchanged tag collection records', async () => {
    const { client, calls } = createFakePocketBase({
      tag_collections: [{ id: 'collection', user_id: 'user-1', name: 'Animated', tags: ['animated'], position: 1 }]
    })
    const repository = new PremiumCloudSyncRepository(client)

    await repository.saveTagCollections([{ name: 'Animated', tags: ['animated'] }])

    expect(calls.filter((call) => call.method !== 'getFullList')).toEqual([])
  })

  it('sends multi-record reorder mutations in one PocketBase batch request', async () => {
    const { client, calls } = createFakePocketBase({
      tag_collections: [
        { id: 'animated', user_id: 'user-1', name: 'Animated', tags: ['animated'], position: 1 },
        { id: 'cat', user_id: 'user-1', name: 'Cat', tags: ['cat'], position: 2 },
        { id: 'dog', user_id: 'user-1', name: 'Dog', tags: ['dog'], position: 3 }
      ]
    })
    const repository = new PremiumCloudSyncRepository(client)

    await repository.saveTagCollections([
      { name: 'Animated', tags: ['animated'] },
      { name: 'Dog', tags: ['dog'] },
      { name: 'Cat', tags: ['cat'] }
    ])

    expect(calls.filter((call) => call.method !== 'getFullList')).toEqual([
      {
        collection: 'tag_collections',
        method: 'batch.update',
        args: ['dog', { user_id: 'user-1', name: 'Dog', tags: ['dog'], position: 2 }]
      },
      {
        collection: 'tag_collections',
        method: 'batch.update',
        args: ['cat', { user_id: 'user-1', name: 'Cat', tags: ['cat'], position: 3 }]
      },
      {
        collection: '__batch__',
        method: 'send',
        args: []
      }
    ])
  })

  it('applies updates before deleting unmatched records', async () => {
    const { client, calls } = createFakePocketBase({
      tag_collections: [
        { id: 'animated', user_id: 'user-1', name: 'Animated', tags: ['animated'], position: 1 },
        { id: 'old', user_id: 'user-1', name: 'Old', tags: ['old'], position: 2 }
      ]
    })
    const repository = new PremiumCloudSyncRepository(client)

    await repository.saveTagCollections([{ name: 'Animated', tags: ['animated', 'gif'] }])

    expect(calls.filter((call) => call.method !== 'getFullList')).toEqual([
      {
        collection: 'tag_collections',
        method: 'batch.update',
        args: ['animated', { user_id: 'user-1', name: 'Animated', tags: ['animated', 'gif'], position: 1 }]
      },
      { collection: 'tag_collections', method: 'batch.delete', args: ['old'] },
      { collection: '__batch__', method: 'send', args: [] }
    ])
  })

  it('deletes saved posts and critical sync records when deleting cloud data', async () => {
    const { client, calls } = createFakePocketBase({
      posts: [{ id: 'saved-post' }],
      tag_collections: [{ id: 'collection' }],
      boorus: [{ id: 'booru' }],
      tag_blocklists: [{ id: 'blocklist' }]
    })
    const repository = new PremiumCloudSyncRepository(client)

    await repository.deleteCloudData()

    expect(calls.filter((call) => call.method === 'getFullList')).toEqual([
      { collection: 'posts', method: 'getFullList', args: [{ fields: 'id', filter: 'user_id = "user-1"' }] },
      {
        collection: 'tag_collections',
        method: 'getFullList',
        args: [{ fields: 'id', filter: 'user_id = "user-1"' }]
      },
      { collection: 'boorus', method: 'getFullList', args: [{ fields: 'id', filter: 'user_id = "user-1"' }] },
      {
        collection: 'tag_blocklists',
        method: 'getFullList',
        args: [{ fields: 'id', filter: 'user_id = "user-1"' }]
      }
    ])
    expect(calls.filter((call) => call.method === 'delete')).toEqual([
      { collection: 'posts', method: 'delete', args: ['saved-post'] },
      { collection: 'tag_collections', method: 'delete', args: ['collection'] },
      { collection: 'boorus', method: 'delete', args: ['booru'] },
      { collection: 'tag_blocklists', method: 'delete', args: ['blocklist'] }
    ])
  })

  it('subscribes to saved posts with the rest of premium cloud data', async () => {
    const { client, calls } = createFakePocketBase({
      posts: [],
      tag_collections: [],
      boorus: [],
      tag_blocklists: []
    })
    const repository = new PremiumCloudSyncRepository(client)

    await repository.subscribeToPremiumCloudChanges({
      savedPosts: () => undefined,
      tagCollections: () => undefined,
      boorus: () => undefined,
      blockList: () => undefined
    })

    expect(calls.filter((call) => call.method === 'subscribe')).toEqual([
      { collection: 'posts', method: 'subscribe', args: ['*'] },
      { collection: 'tag_collections', method: 'subscribe', args: ['*'] },
      { collection: 'boorus', method: 'subscribe', args: ['*'] },
      { collection: 'tag_blocklists', method: 'subscribe', args: ['*'] }
    ])
  })

  it('routes saved post realtime events without notifying critical sync handlers', async () => {
    const { client, subscribers } = createFakePocketBase({
      posts: [],
      tag_collections: [],
      boorus: [],
      tag_blocklists: []
    })
    const repository = new PremiumCloudSyncRepository(client)
    const changes: string[] = []

    await repository.subscribeToPremiumCloudChanges({
      savedPosts: () => changes.push('savedPosts'),
      tagCollections: () => changes.push('tagCollections'),
      boorus: () => changes.push('boorus'),
      blockList: () => changes.push('blockList')
    })

    subscribers.posts[0]?.({
      action: 'create',
      record: { id: 'post-1', original_id: 34, original_domain: 'rule34.xxx' }
    })

    expect(changes).toEqual(['savedPosts'])
  })
})
