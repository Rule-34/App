import type { Domain, DomainConfig } from '../assets/js/domain'
import Post, { type IPost } from '../assets/js/post.dto'
import { PocketbasePost, type IPocketbasePost, type ISimplePocketbasePost } from '../assets/js/pocketbase.dto'
import type { ITag } from '../assets/js/tag.dto'
import type { ITagCollection } from '../assets/js/tagCollection.dto'

export const premiumCloudCollections = {
  posts: 'posts',
  tagCollections: 'tag_collections',
  boorus: 'boorus',
  blocklists: 'tag_blocklists'
} as const

export const cloudDataCollectionNames = [
  premiumCloudCollections.posts,
  premiumCloudCollections.tagCollections,
  premiumCloudCollections.boorus,
  premiumCloudCollections.blocklists
] as const

export type PremiumTagCollectionRecord = {
  id: string
  user_id: string
  name: string
  tags: string[]
  position: number
}

export type PremiumTagCollectionPayload = {
  user_id: string
  name: string
  tags: string[]
  position: number
}

export type PremiumBooruRecord = {
  id: string
  user_id: string
  domain: string
  type: string
  config: DomainConfig | null
  position: number
}

export type PremiumBooruPayload = {
  user_id: string
  domain: string
  type: string
  config: DomainConfig | null
  position: number
}

export type PremiumBlockListRecord = {
  id: string
  user_id: string
  tags: string[]
}

export type PremiumBlockListPayload = {
  user_id: string
  tags: string[]
}

export type PremiumCloudState = {
  savedPosts: ISimplePocketbasePost[]
  tagCollections: ITagCollection[]
  boorus: PremiumBooruRecord[]
  blockList: PremiumBlockListRecord[]
}

export type PremiumCloudRealtimeHandlers = {
  savedPosts: (event: unknown) => unknown | Promise<unknown>
  tagCollections: (event: unknown) => unknown | Promise<unknown>
  boorus: (event: unknown) => unknown | Promise<unknown>
  blockList: (event: unknown) => unknown | Promise<unknown>
}

export type LatestAsyncQueue<T> = ((payload: T) => Promise<void>) & {
  invalidate: () => void
}

export function createLatestAsyncQueue<T>(
  save: (payload: T, isCurrent: () => boolean) => Promise<void>
): LatestAsyncQueue<T> {
  let active: Promise<void> | null = null
  let latestPayload: { payload: T; generation: number } | undefined
  let hasLatestPayload = false
  let generation = 0

  async function flush() {
    let error: unknown

    while (hasLatestPayload) {
      const { payload, generation: payloadGeneration } = latestPayload as { payload: T; generation: number }
      const isCurrent = () => generation === payloadGeneration
      latestPayload = undefined
      hasLatestPayload = false

      try {
        await save(payload, isCurrent)
        error = undefined
      } catch (caughtError) {
        if (isCurrent()) {
          error = caughtError
        }
      }
    }

    if (error) {
      throw error
    }
  }

  const queue = ((payload: T) => {
    latestPayload = { payload, generation }
    hasLatestPayload = true
    active ??= flush().finally(() => {
      active = null
    })

    return active
  }) as LatestAsyncQueue<T>

  queue.invalidate = () => {
    generation += 1
    latestPayload = undefined
    hasLatestPayload = false
  }

  return queue
}

type PremiumCloudCollectionClient = {
  getFullList<T>(options?: unknown): Promise<T[]>
  getList<T>(
    page?: number,
    perPage?: number,
    options?: unknown
  ): Promise<{
    page: number
    perPage: number
    totalItems: number
    totalPages: number
    items: T[]
  }>
  create<T>(payload: Record<string, unknown>): Promise<T>
  update<T>(id: string, payload: Record<string, unknown>): Promise<T>
  delete(id: string): Promise<boolean>
  subscribe?(
    topic: string,
    callback: (event: unknown) => void,
    options?: unknown
  ): Promise<(() => unknown | Promise<unknown>) | undefined>
}

type PremiumCloudBatchCollectionClient = {
  create(payload: Record<string, unknown>): void
  update(id: string, payload: Record<string, unknown>): void
  delete(id: string): void
}

type PremiumCloudBatchClient = {
  collection(name: string): PremiumCloudBatchCollectionClient
  send(): Promise<unknown>
}

export type PremiumCloudPocketBaseClient = {
  authStore: {
    isValid: boolean
    record: { id: string } | null
  }
  filter?(expression: string, params?: Record<string, unknown>): string
  collection(name: string): PremiumCloudCollectionClient
  createBatch(): PremiumCloudBatchClient
}

export type PremiumSavedPostsFilters = {
  type?: string
  rating?: string
  score?: string
  sort?: string
}

export type LoadSavedPostsPageOptions = {
  page: number
  perPage: number
  filters: PremiumSavedPostsFilters

  /**
   * Tag names, optionally prefixed with `-` to exclude them
   */
  tags?: readonly string[]
}

export class PremiumCloudRepository {
  constructor(private readonly client: PremiumCloudPocketBaseClient) {}

  async loadPremiumCloudState(): Promise<PremiumCloudState> {
    const [savedPosts, tagCollections, boorus, blockList] = await Promise.all([
      this.loadSavedPosts(),
      this.loadTagCollections(),
      this.loadBoorus(),
      this.loadBlockList()
    ])

    return {
      savedPosts,
      tagCollections,
      boorus,
      blockList
    }
  }

  loadSavedPosts() {
    return this.client
      .collection(premiumCloudCollections.posts)
      .getFullList<ISimplePocketbasePost>({
        fields: 'id, original_id, original_domain'
      })
      .then((records) => records.map(savedPostSummaryFromRecord))
  }

  loadTagCollections() {
    return this.client
      .collection(premiumCloudCollections.tagCollections)
      .getFullList<PremiumTagCollectionRecord>({ sort: 'position' })
      .then(tagCollectionsFromCloudRecords)
  }

  loadBoorus() {
    return this.client
      .collection(premiumCloudCollections.boorus)
      .getFullList<PremiumBooruRecord>({ sort: 'position' })
      .then((records) => [...records])
  }

  loadBlockList() {
    return this.client
      .collection(premiumCloudCollections.blocklists)
      .getFullList<PremiumBlockListRecord>()
      .then((records) => [...records])
  }

  /**
   * One page of the user's saved posts, newest first by default.
   *
   * `filters` become `&&`-joined clauses and `tags` are added on top through `savedPostTagFilter`,
   * so a tag named with a leading `-` excludes it instead of requiring it.
   */
  async loadSavedPostsPage({ page, perPage, filters, tags = [] }: LoadSavedPostsPageOptions) {
    const requestFilters: string[] = []

    if (filters.type) {
      requestFilters.push(this.clientFilter('media_type = {:type}', { type: filters.type }))
    }

    if (filters.rating) {
      requestFilters.push(this.clientFilter('rating = {:rating}', { rating: filters.rating }))
    }

    if (filters.score) {
      requestFilters.push(this.clientFilter('score >= {:score}', { score: filters.score }))
    }

    for (const tag of tags) {
      const tagFilter = savedPostTagFilter(tag)

      if (tagFilter) {
        requestFilters.push(this.clientFilter(tagFilter.expression, tagFilter.params))
      }
    }

    const response = await this.client
      .collection(premiumCloudCollections.posts)
      .getList<IPocketbasePost>(page, perPage, {
        sort: filters.sort ?? '-created',
        filter: requestFilters.join(' && '),
        $autoCancel: false
      })

    return {
      data: response.items.map((item) => Post.fromPocketbasePost(item)),
      meta: {
        items_count: response.items.length,
        total_items: response.totalItems,
        current_page: response.page,
        total_pages: response.totalPages,
        items_per_page: response.perPage
      }
    }
  }

  /**
   * Tag suggestions for the saved-posts search, taken from the tags of the user's own saved posts.
   */
  async searchSavedPostTags(query: string): Promise<ITag[]> {
    const raw = query.trim().startsWith('-') ? query.trim().slice(1) : query
    const normalizedQuery = normalizeTagQuery(raw)

    if (!normalizedQuery) {
      return []
    }

    const response = await this.client
      .collection(premiumCloudCollections.posts)
      .getList<
        Pick<IPocketbasePost, 'tags_artist' | 'tags_character' | 'tags_copyright' | 'tags_general' | 'tags_meta'>
      >(1, savedPostTagSuggestionRecordLimit, {
        sort: '-created',
        filter: this.clientFilter(
          'tags_general ?~ {:tag} || tags_character ?~ {:tag} || tags_artist ?~ {:tag} || tags_copyright ?~ {:tag} || tags_meta ?~ {:tag}',
          { tag: savedPostTagNamePattern(normalizedQuery) }
        ),
        fields: 'tags_artist,tags_character,tags_copyright,tags_general,tags_meta',
        $autoCancel: false
      })

    const tags: ITag[] = response.items.flatMap((item) => [
      ...(item.tags_artist ?? []).map((name) => ({ name, type: 'artist' as const })),
      ...(item.tags_character ?? []).map((name) => ({ name, type: 'character' as const })),
      ...(item.tags_copyright ?? []).map((name) => ({ name, type: 'copyright' as const })),
      ...(item.tags_general ?? []).map((name) => ({ name, type: 'general' as const })),
      ...(item.tags_meta ?? []).map((name) => ({ name, type: 'meta' as const }))
    ])

    return rankSavedPostTagSuggestions(tags, normalizedQuery)
  }

  async savePost(post: IPost) {
    const { id: _id, ...payload } = PocketbasePost.fromPost(post, this.userId)
    const record = await this.client.collection(premiumCloudCollections.posts).create<ISimplePocketbasePost>(payload)

    return savedPostSummaryFromRecord(record)
  }

  async deleteSavedPost(id: string) {
    await this.client.collection(premiumCloudCollections.posts).delete(id)
  }

  async saveTagCollections(tagCollections: readonly ITagCollection[]) {
    const records = await this.listTagCollections()
    const payloads = tagCollectionPayloadsFromState(this.userId, tagCollections)

    await this.replaceRecords(
      premiumCloudCollections.tagCollections,
      records,
      payloads,
      'name',
      (record) => record.name
    )
  }

  async saveBoorus(boorus: readonly Domain[]) {
    const records = await this.listBoorus()
    const payloads = booruPayloadsFromState(this.userId, boorus)

    await this.replaceRecords(premiumCloudCollections.boorus, records, payloads, 'domain', (record) => record.domain)
  }

  async saveCustomBlockList(tags: readonly string[]) {
    const records = await this.listBlockLists()
    const payload = customBlockListPayloadFromState(this.userId, tags)
    const collection = this.client.collection(premiumCloudCollections.blocklists)
    const [record] = records

    if (record) {
      const deletes = records.slice(1)

      if (deletes.length) {
        await this.sendBatchMutations(premiumCloudCollections.blocklists, [{ record, payload }], [], deletes)
        return
      }

      await collection.update(record.id, payload)
      return
    }

    await collection.create(payload)
  }

  async deleteCloudData() {
    this.assertAuthenticated()

    for (const collectionName of cloudDataCollectionNames) {
      await this.deleteCollectionRecords(collectionName)
    }
  }

  async clearTagCollections() {
    await this.deleteCollectionRecords(premiumCloudCollections.tagCollections)
  }

  async clearBoorus() {
    await this.deleteCollectionRecords(premiumCloudCollections.boorus)
  }

  async deleteAccount() {
    await this.deleteCloudData()
    await this.client.collection('users').delete(this.userId)
  }

  async subscribeToPremiumCloudChanges(handlers: PremiumCloudRealtimeHandlers) {
    const subscriptions = [
      [premiumCloudCollections.posts, handlers.savedPosts],
      [premiumCloudCollections.tagCollections, handlers.tagCollections],
      [premiumCloudCollections.boorus, handlers.boorus],
      [premiumCloudCollections.blocklists, handlers.blockList]
    ] as const
    const unsubscriptions: Array<() => unknown | Promise<unknown>> = []

    try {
      for (const [collectionName, handler] of subscriptions) {
        const unsubscribe = await this.subscribeToCollection(collectionName, handler)

        if (unsubscribe) {
          unsubscriptions.push(unsubscribe)
        }
      }
    } catch (error) {
      await Promise.allSettled(unsubscriptions.map((unsubscribe) => unsubscribe()))
      throw error
    }

    return async () => {
      await Promise.allSettled(unsubscriptions.map((unsubscribe) => unsubscribe()))
    }
  }

  private get userId() {
    const id = this.client.authStore.record?.id

    if (!this.client.authStore.isValid || !id) {
      throw new Error('Premium cloud sync requires an authenticated user')
    }

    return id
  }

  private listTagCollections() {
    return this.client
      .collection(premiumCloudCollections.tagCollections)
      .getFullList<PremiumTagCollectionRecord>({ sort: 'position' })
  }

  private listBoorus() {
    return this.client.collection(premiumCloudCollections.boorus).getFullList<PremiumBooruRecord>({ sort: 'position' })
  }

  private listBlockLists() {
    return this.client.collection(premiumCloudCollections.blocklists).getFullList<PremiumBlockListRecord>()
  }

  private async replaceRecords<TRecord extends { id: string }, TPayload extends Record<string, unknown>>(
    collectionName: string,
    records: readonly TRecord[],
    payloads: readonly TPayload[],
    payloadKey: keyof TPayload,
    keyFromRecord: (record: TRecord) => string
  ) {
    const collection = this.client.collection(collectionName)
    const recordsByKey = new Map(records.map((record) => [keyFromRecord(record), record]))
    const usedRecordIds = new Set<string>()
    const updates: Array<{ record: TRecord; payload: TPayload }> = []
    const creates: TPayload[] = []
    const deletes: TRecord[] = []

    for (const [position, payload] of payloads.entries()) {
      const recordByKey = recordsByKey.get(String(payload[payloadKey]))
      const recordByPosition = records[position]
      const record = recordByKey && !usedRecordIds.has(recordByKey.id) ? recordByKey : recordByPosition

      if (!record || usedRecordIds.has(record.id)) {
        creates.push(payload)
        continue
      }

      usedRecordIds.add(record.id)

      if (!recordMatchesPayload(record as Record<string, unknown>, payload)) {
        updates.push({ record, payload })
      }
    }

    for (const record of records) {
      if (!usedRecordIds.has(record.id)) {
        deletes.push(record)
      }
    }

    if (updates.length + creates.length + deletes.length >= 2) {
      await this.sendBatchMutations(collectionName, updates, creates, deletes)
      return
    }

    for (const { record, payload } of updates) {
      await collection.update(record.id, payload)
    }

    for (const payload of creates) {
      await collection.create(payload)
    }

    for (const record of deletes) {
      await collection.delete(record.id)
    }
  }

  private async sendBatchMutations<TRecord extends { id: string }, TPayload extends Record<string, unknown>>(
    collectionName: string,
    updates: ReadonlyArray<{ record: TRecord; payload: TPayload }>,
    creates: readonly TPayload[],
    deletes: readonly TRecord[]
  ) {
    const batch = this.client.createBatch()
    const collection = batch.collection(collectionName)

    for (const { record, payload } of updates) {
      collection.update(record.id, payload)
    }

    for (const payload of creates) {
      collection.create(payload)
    }

    for (const record of deletes) {
      collection.delete(record.id)
    }

    await batch.send()
  }

  private async subscribeToCollection(
    collectionName: string,
    onChange: (event: unknown) => unknown | Promise<unknown>
  ) {
    const collection = this.client.collection(collectionName)

    if (!collection.subscribe) {
      return undefined
    }

    return collection.subscribe('*', onChange)
  }

  private async deleteCollectionRecords(collectionName: string) {
    const collection = this.client.collection(collectionName)
    const records = await collection.getFullList<{ id: string }>({ fields: 'id' })

    if (records.length) {
      await this.sendBatchMutations(collectionName, [], [], records)
    }
  }

  private assertAuthenticated() {
    return this.userId
  }

  private clientFilter(expression: string, params: Record<string, unknown>) {
    if (this.client.filter) {
      return this.client.filter(expression, params)
    }

    return Object.entries(params).reduce(
      (filter, [key, value]) => filter.replace(`{:${key}}`, JSON.stringify(value)),
      expression
    )
  }
}

export { PremiumCloudRepository as PremiumCloudSyncRepository }

const savedPostTagSuggestionRecordLimit = 50
const savedPostTagSuggestionLimit = 20

/**
 * Tag values in PocketBase are stored across the category JSON columns (`tags_general`,
 * `tags_character`, `tags_artist`, `tags_copyright`, `tags_meta`) as arrays of strings.
 *
 * Matching against a serialized JSON array like `["solo","1girl"]` matches the string inside
 * quotes. The pattern starts with a quote so callers can anchor it for an exact match or
 * leave it open as a prefix search.
 *
 * `%` is a LIKE wildcard, so a literal one has to be escaped or the filter matches nothing
 * (verified against PocketBase 0.40.4: `tags ?~ "\"100%real\""` returns no rows while
 * `tags ?~ "\"100\%real\""` returns the tagged post). `_` needs no escaping, PocketBase already
 * treats it literally, which keeps `solo` and `solo_focus` apart on their own.
 */
export function savedPostTagNamePattern(tagName: string) {
  return `"${normalizeTagQuery(tagName).replaceAll('%', '\\%')}`
}

/**
 * Turns a saved-post tag query into a PocketBase filter across all tag category columns.
 * A leading `-` excludes the tag instead of requiring it, and a query without a tag name
 * is not a filter at all.
 *
 * `?~` means "any tag in the array matches". `!~` checks exclusion. Posts saved before
 * the tag fields existed or with null tags are kept explicitly on exclusions.
 *
 * The trailing quote keeps the match anchored to a whole tag name: searching for `solo`
 * must not return posts tagged `solo_focus`.
 */
export function savedPostTagFilter(tag: string): { expression: string; params: Record<string, string> } | undefined {
  const isExcluded = tag.startsWith('-')
  const name = (isExcluded ? tag.slice(1) : tag).trim()

  if (!normalizeTagQuery(name)) {
    return undefined
  }

  const pattern = `${savedPostTagNamePattern(name)}"`

  return isExcluded
    ? {
        expression:
          '((tags_general !~ {:tag} || tags_general = null) && (tags_character !~ {:tag} || tags_character = null) && (tags_artist !~ {:tag} || tags_artist = null) && (tags_copyright !~ {:tag} || tags_copyright = null) && (tags_meta !~ {:tag} || tags_meta = null))',
        params: { tag: pattern }
      }
    : {
        expression:
          '(tags_general ?~ {:tag} || tags_character ?~ {:tag} || tags_artist ?~ {:tag} || tags_copyright ?~ {:tag} || tags_meta ?~ {:tag})',
        params: { tag: pattern }
      }
}

/**
 * Quotes and backslashes would escape the LIKE pattern built by `savedPostTagNamePattern`, so they
 * are dropped before the pattern is built. `%` is escaped there, once the input is clean.
 */
export function normalizeTagQuery(query: string) {
  return query.replace(/["\\]/g, '').trim()
}

/**
 * Keeps the tags of the fetched saved posts that match the query, ranks them by how often they
 * occur and drops duplicates.
 */
export function rankSavedPostTagSuggestions(
  tags: readonly ITag[],
  query: string,
  limit = savedPostTagSuggestionLimit
): ITag[] {
  const prefix = query.toLowerCase()
  const matches = new Map<string, { tag: ITag; count: number }>()

  for (const tag of tags) {
    const name = tag.name?.trim()

    if (!name || !name.toLowerCase().startsWith(prefix)) {
      continue
    }

    const match = matches.get(name)

    if (match) {
      match.count += 1
      continue
    }

    matches.set(name, { tag: { name, type: tag.type }, count: 1 })
  }

  return [...matches.values()]
    .sort((a, b) => b.count - a.count || a.tag.name.localeCompare(b.tag.name))
    .slice(0, limit)
    .map((match) => match.tag)
}

function savedPostSummaryFromRecord(record: ISimplePocketbasePost): ISimplePocketbasePost {
  return {
    id: record.id,
    original_id: record.original_id,
    original_domain: record.original_domain
  }
}

export function tagCollectionsFromCloudRecords(records: readonly PremiumTagCollectionRecord[]): ITagCollection[] {
  return sortByPosition(records).map((record) => ({
    name: record.name,
    tags: [...record.tags]
  }))
}

export function tagCollectionPayloadsFromState(
  userId: string,
  tagCollections: readonly ITagCollection[]
): PremiumTagCollectionPayload[] {
  return tagCollections.map((tagCollection, position) => ({
    user_id: userId,
    name: tagCollection.name,
    tags: [...tagCollection.tags],
    position: position + 1
  }))
}

export function booruPayloadsFromState(userId: string, boorus: readonly Domain[]): PremiumBooruPayload[] {
  return boorus.map((booru, position) => ({
    user_id: userId,
    domain: booru.domain,
    type: booru.type.type,
    config: booru.config,
    position: position + 1
  }))
}

export function customBlockListPayloadFromState(userId: string, tags: readonly string[]): PremiumBlockListPayload {
  return {
    user_id: userId,
    tags: [...tags]
  }
}

function sortByPosition<T extends { position: number }>(records: readonly T[]): T[] {
  return [...records].sort((a, b) => a.position - b.position)
}

function recordMatchesPayload(record: Record<string, unknown>, payload: Record<string, unknown>) {
  return Object.entries(payload).every(([key, value]) => cloudValuesEqual(record[key], value))
}

function cloudValuesEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) {
    return true
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    return left.length === right.length && left.every((value, index) => cloudValuesEqual(value, right[index]))
  }

  if (isPlainRecord(left) && isPlainRecord(right)) {
    const leftKeys = Object.keys(left).sort()
    const rightKeys = Object.keys(right).sort()

    return (
      leftKeys.length === rightKeys.length &&
      leftKeys.every((key, index) => key === rightKeys[index] && cloudValuesEqual(left[key], right[key]))
    )
  }

  return false
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}
