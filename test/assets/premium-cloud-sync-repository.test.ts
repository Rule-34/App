import { describe, expect, it, vi } from 'vitest'
import { PremiumCloudSyncRepository } from '../../app/assets/js/PremiumCloudSync'

type FakeRecord = { id: string; [key: string]: unknown }

function createFakePocketBase(initialRecords: Record<string, FakeRecord[]>) {
  const records = structuredClone(initialRecords)
  const calls: Array<{ collection: string; method: string; args: unknown[] }> = []

  return {
    calls,
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
      tag_collections: [],
      boorus: [],
      tag_blocklists: []
    })
    const repository = new PremiumCloudSyncRepository(client)

    const state = await repository.loadCriticalState()

    expect(state).toEqual({
      tagCollections: [],
      boorus: [],
      blockList: []
    })
    expect(calls.map((call) => call.method)).toEqual(['getFullList', 'getFullList', 'getFullList'])
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

    expect(calls.filter((call) => call.method === 'delete')).toEqual([
      { collection: 'posts', method: 'delete', args: ['saved-post'] },
      { collection: 'tag_collections', method: 'delete', args: ['collection'] },
      { collection: 'boorus', method: 'delete', args: ['booru'] },
      { collection: 'tag_blocklists', method: 'delete', args: ['blocklist'] }
    ])
  })
})
