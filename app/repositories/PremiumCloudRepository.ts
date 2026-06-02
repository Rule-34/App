import type { Domain, DomainConfig } from '../assets/js/domain'
import Post, { type IPost } from '../assets/js/post.dto'
import { PocketbasePost, type IPocketbasePost, type ISimplePocketbasePost } from '../assets/js/pocketbase.dto'
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

export function createLatestAsyncQueue<T>(save: (payload: T) => Promise<void>) {
  let active: Promise<void> | null = null
  let latestPayload: T | undefined
  let hasLatestPayload = false

  async function flush() {
    let error: unknown

    while (hasLatestPayload) {
      const payload = latestPayload as T
      latestPayload = undefined
      hasLatestPayload = false

      try {
        await save(payload)
      } catch (caughtError) {
        error ??= caughtError
      }
    }

    if (error) {
      throw error
    }
  }

  return (payload: T) => {
    latestPayload = payload
    hasLatestPayload = true
    active ??= flush().finally(() => {
      active = null
    })

    return active
  }
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
  domain: string
  allPostsDomain: string
  filters: PremiumSavedPostsFilters
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

  async loadSavedPostsPage({ page, perPage, domain, allPostsDomain, filters }: LoadSavedPostsPageOptions) {
    const requestFilters: string[] = []

    if (domain !== allPostsDomain) {
      requestFilters.push(this.clientFilter('original_domain = {:original_domain}', { original_domain: domain }))
    }

    if (filters.type) {
      requestFilters.push(this.clientFilter('media_type = {:type}', { type: filters.type }))
    }

    if (filters.rating) {
      requestFilters.push(this.clientFilter('rating = {:rating}', { rating: filters.rating }))
    }

    if (filters.score) {
      requestFilters.push(this.clientFilter('score >= {:score}', { score: filters.score }))
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

    if (records.length >= 2) {
      await this.sendBatchMutations(collectionName, [], [], records)
      return
    }

    for (const record of records) {
      await collection.delete(record.id)
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
