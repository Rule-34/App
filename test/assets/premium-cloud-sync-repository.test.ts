import { describe, expect, it, vi } from 'vitest'
import PocketBase from 'pocketbase'
import {
  PremiumCloudSyncRepository,
  normalizeTagQuery,
  rankSavedPostTagSuggestions,
  savedPostTagFilter,
  savedPostTagNamePattern
} from '../../app/repositories/PremiumCloudRepository'

type FakeRecord = { id: string; [key: string]: unknown }

// The SDK's own helper, so the filters asserted here are the ones production sends
const sdkClient = new PocketBase('https://pocketbase.test')

function createFakePocketBase(
  initialRecords: Record<string, FakeRecord[]>,
  options: { failSubscribeCollections?: readonly string[] } = {}
) {
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
          getList: vi.fn(async (page = 1, perPage = 30, ...args: unknown[]) => {
            calls.push({ collection: name, method: 'getList', args: [page, perPage, ...args] })

            return {
              page,
              perPage,
              totalItems: records[name].length,
              totalPages: records[name].length ? Math.ceil(records[name].length / perPage) : 0,
              items: records[name]
            }
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
            if (options.failSubscribeCollections?.includes(name)) {
              throw new Error(`Failed to subscribe to ${name}`)
            }

            calls.push({ collection: name, method: 'subscribe', args: [topic] })
            subscribers[name] ??= []
            subscribers[name].push(callback)

            return async () => {
              calls.push({ collection: name, method: 'unsubscribe', args: [topic] })
            }
          })
        }
      },
      filter: (expression: string, params?: Record<string, unknown>) => sdkClient.filter(expression, params),
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
        args: [{ fields: 'id, original_id, original_domain' }]
      },
      {
        collection: 'tag_collections',
        method: 'getFullList',
        args: [{ sort: 'position' }]
      },
      {
        collection: 'boorus',
        method: 'getFullList',
        args: [{ sort: 'position' }]
      },
      {
        collection: 'tag_blocklists',
        method: 'getFullList',
        args: []
      }
    ])
  })

  it('loads saved post summaries from the posts collection', async () => {
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
      args: [{ fields: 'id, original_id, original_domain' }]
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

  it('loads saved post pages with real total metadata', async () => {
    const { client, calls } = createFakePocketBase({
      posts: [
        {
          id: 'saved-post-1',
          user_id: 'user-1',
          original_id: 34,
          original_domain: 'rule34.xxx',
          high_res_file: 'https://img.example/high.jpg',
          preview_file: 'https://img.example/preview.jpg',
          tags_artist: [],
          tags_character: [],
          tags_copyright: [],
          tags_general: ['tag'],
          tags_meta: [],
          sources: [],
          rating: 'explicit',
          media_type: 'image'
        }
      ]
    })
    const repository = new PremiumCloudSyncRepository(client)

    const page = await repository.loadSavedPostsPage({
      page: 1,
      perPage: 30,
      filters: {}
    })

    expect(page.meta).toEqual({
      items_count: 1,
      total_items: 1,
      current_page: 1,
      total_pages: 1,
      items_per_page: 30
    })
    expect(calls).toContainEqual({
      collection: 'posts',
      method: 'getList',
      args: [
        1,
        30,
        {
          sort: '-created',
          filter: '',
          $autoCancel: false
        }
      ]
    })
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

  it('removes duplicate custom blocklist records when saving', async () => {
    const { client, calls } = createFakePocketBase({
      tag_blocklists: [
        { id: 'blocklist', user_id: 'user-1', tags: ['old'] },
        { id: 'duplicate-blocklist', user_id: 'user-1', tags: ['stale'] }
      ]
    })
    const repository = new PremiumCloudSyncRepository(client)

    await repository.saveCustomBlockList(['loli'])

    expect(calls.filter((call) => call.method !== 'getFullList')).toEqual([
      {
        collection: 'tag_blocklists',
        method: 'batch.update',
        args: ['blocklist', { user_id: 'user-1', tags: ['loli'] }]
      },
      { collection: 'tag_blocklists', method: 'batch.delete', args: ['duplicate-blocklist'] },
      { collection: '__batch__', method: 'send', args: [] }
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
      { collection: 'posts', method: 'getFullList', args: [{ fields: 'id' }] },
      {
        collection: 'tag_collections',
        method: 'getFullList',
        args: [{ fields: 'id' }]
      },
      { collection: 'boorus', method: 'getFullList', args: [{ fields: 'id' }] },
      {
        collection: 'tag_blocklists',
        method: 'getFullList',
        args: [{ fields: 'id' }]
      }
    ])
    expect(calls.filter((call) => call.method !== 'getFullList')).toEqual([
      { collection: 'posts', method: 'batch.delete', args: ['saved-post'] },
      { collection: '__batch__', method: 'send', args: [] },
      { collection: 'tag_collections', method: 'batch.delete', args: ['collection'] },
      { collection: '__batch__', method: 'send', args: [] },
      { collection: 'boorus', method: 'batch.delete', args: ['booru'] },
      { collection: '__batch__', method: 'send', args: [] },
      { collection: 'tag_blocklists', method: 'batch.delete', args: ['blocklist'] },
      { collection: '__batch__', method: 'send', args: [] }
    ])
  })

  it('batch deletes multiple records when clearing a collection', async () => {
    const { client, calls } = createFakePocketBase({
      tag_collections: [{ id: 'collection-1' }, { id: 'collection-2' }]
    })
    const repository = new PremiumCloudSyncRepository(client)

    await repository.clearTagCollections()

    expect(calls.filter((call) => call.method !== 'getFullList')).toEqual([
      { collection: 'tag_collections', method: 'batch.delete', args: ['collection-1'] },
      { collection: 'tag_collections', method: 'batch.delete', args: ['collection-2'] },
      { collection: '__batch__', method: 'send', args: [] }
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

  it('cleans up successful realtime subscriptions when a later subscription fails', async () => {
    const { client, calls } = createFakePocketBase(
      {
        posts: [],
        tag_collections: [],
        boorus: [],
        tag_blocklists: []
      },
      { failSubscribeCollections: ['tag_collections'] }
    )
    const repository = new PremiumCloudSyncRepository(client)

    await expect(
      repository.subscribeToPremiumCloudChanges({
        savedPosts: () => undefined,
        tagCollections: () => undefined,
        boorus: () => undefined,
        blockList: () => undefined
      })
    ).rejects.toThrow('Failed to subscribe to tag_collections')

    expect(calls).toContainEqual({ collection: 'posts', method: 'subscribe', args: ['*'] })
    expect(calls).toContainEqual({ collection: 'posts', method: 'unsubscribe', args: ['*'] })
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

describe('saved post tags', () => {
  it('filters saved post pages by included and excluded tags', async () => {
    const { client, calls } = createFakePocketBase({ posts: [] })
    const repository = new PremiumCloudSyncRepository(client)

    await repository.loadSavedPostsPage({
      page: 2,
      perPage: 30,
      filters: { rating: 'explicit' },
      tags: ['solo', '-yaoi', '  ']
    })

    expect(calls).toContainEqual({
      collection: 'posts',
      method: 'getList',
      args: [
        2,
        30,
        {
          sort: '-created',
          filter: String.raw`rating = "explicit" && (tags_general ?~ "\"solo\"" || tags_character ?~ "\"solo\"" || tags_artist ?~ "\"solo\"" || tags_copyright ?~ "\"solo\"" || tags_meta ?~ "\"solo\"") && ((tags_general !~ "\"yaoi\"" || tags_general = null) && (tags_character !~ "\"yaoi\"" || tags_character = null) && (tags_artist !~ "\"yaoi\"" || tags_artist = null) && (tags_copyright !~ "\"yaoi\"" || tags_copyright = null) && (tags_meta !~ "\"yaoi\"" || tags_meta = null))`,
          $autoCancel: false
        }
      ]
    })
  })

  it('anchors tag filters to whole tag names across all tag fields', () => {
    expect(savedPostTagFilter('solo')).toEqual({
      expression:
        '(tags_general ?~ {:tag} || tags_character ?~ {:tag} || tags_artist ?~ {:tag} || tags_copyright ?~ {:tag} || tags_meta ?~ {:tag})',
      params: { tag: '"solo"' }
    })
    expect(savedPostTagFilter('-solo')).toEqual({
      expression:
        '((tags_general !~ {:tag} || tags_general = null) && (tags_character !~ {:tag} || tags_character = null) && (tags_artist !~ {:tag} || tags_artist = null) && (tags_copyright !~ {:tag} || tags_copyright = null) && (tags_meta !~ {:tag} || tags_meta = null))',
      params: { tag: '"solo"' }
    })

    // A negative tag without a name is not a filter
    expect(savedPostTagFilter('-   ')).toBeUndefined()
  })

  it('builds tag name patterns starting with a quote for prefix and exact matching', () => {
    expect(savedPostTagNamePattern('artist')).toBe('"artist')
    expect(savedPostTagFilter('artist')?.params.tag).toBe('"artist"')
    expect(savedPostTagFilter('-artist')?.params.tag).toBe('"artist"')
  })

  it('drops characters that would escape the tag pattern', () => {
    expect(normalizeTagQuery('  "style \\ shift  ')).toBe('style  shift')
  })

  it('escapes a literal percent so it is not read as a LIKE wildcard', () => {
    // Verified against PocketBase 0.40.4: a bare `%` makes the filter match no rows at all,
    // while the escaped one matches the tag holding it.
    expect(savedPostTagNamePattern('100%real')).toBe('"100\\%real')
    expect(savedPostTagFilter('100%real')?.params.tag).toBe('"100\\%real"')

    // `_` is literal in PocketBase already, escaping it would change nothing
    expect(savedPostTagNamePattern('solo_focus')).toBe('"solo_focus')
  })

  it('ranks tag suggestions by how often they occur and drops duplicates', () => {
    const suggestions = rankSavedPostTagSuggestions(
      [
        { name: 'solo', type: 'general' },
        { name: 'solo', type: 'general' },
        { name: 'solitude', type: 'character' },
        { name: '1girl', type: 'general' }
      ],
      'SOL'
    )

    expect(suggestions).toEqual([
      { name: 'solo', type: 'general' },
      { name: 'solitude', type: 'character' }
    ])
  })

  it('suggests tags from the saved posts that match the query', async () => {
    const { client, calls } = createFakePocketBase({
      posts: [
        {
          id: 'saved-post-1',
          tags_general: ['solo'],
          tags_character: ['solitude']
        },
        {
          id: 'saved-post-2',
          tags_general: ['solo', '1girl']
        },
        { id: 'saved-post-3' }
      ]
    })
    const repository = new PremiumCloudSyncRepository(client)

    const suggestions = await repository.searchSavedPostTags('sol')

    expect(calls).toContainEqual({
      collection: 'posts',
      method: 'getList',
      args: [
        1,
        50,
        {
          sort: '-created',
          filter: String.raw`tags_general ?~ "\"sol" || tags_character ?~ "\"sol" || tags_artist ?~ "\"sol" || tags_copyright ?~ "\"sol" || tags_meta ?~ "\"sol"`,
          fields: 'tags_artist,tags_character,tags_copyright,tags_general,tags_meta',
          $autoCancel: false
        }
      ]
    })
    expect(suggestions).toEqual([
      { name: 'solo', type: 'general' },
      { name: 'solitude', type: 'character' }
    ])
  })

  it('does not query saved posts for an empty tag suggestion query', async () => {
    const { client, calls } = createFakePocketBase({ posts: [] })
    const repository = new PremiumCloudSyncRepository(client)

    await expect(repository.searchSavedPostTags(' " ')).resolves.toEqual([])
    expect(calls).toEqual([])
  })
})
