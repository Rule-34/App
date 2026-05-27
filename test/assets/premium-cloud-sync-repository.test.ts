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
            records[name][index] = { ...records[name][index], ...payload }
            return records[name][index]
          }),
          delete: vi.fn(async (id: string) => {
            calls.push({ collection: name, method: 'delete', args: [id] })
            records[name] = records[name].filter((record) => record.id !== id)
            return true
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

    expect(state.shouldSubscribe).toBe(false)
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
        args: ['collection', { user_id: 'user-1', name: 'New', tags: ['new'], position: 0 }]
      }
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
