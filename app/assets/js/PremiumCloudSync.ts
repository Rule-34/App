import type { Domain, DomainConfig } from './domain'
import type { ITagCollection } from './tagCollection.dto'

export const premiumCloudCollections = {
  tagCollections: 'tag_collections',
  boorus: 'boorus',
  blocklists: 'tag_blocklists'
} as const

export const cloudDataCollectionNames = [
  'posts',
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

export type PremiumCriticalCloudState = {
  tagCollections: ITagCollection[]
  boorus: PremiumBooruRecord[]
  blockList: PremiumBlockListRecord[]
  shouldSubscribe: boolean
}

type PremiumCloudCollectionClient = {
  getFullList<T>(options?: unknown): Promise<T[]>
  create<T>(payload: Record<string, unknown>): Promise<T>
  update<T>(id: string, payload: Record<string, unknown>): Promise<T>
  delete(id: string): Promise<boolean>
  subscribe?(
    topic: string,
    callback: (event: unknown) => void,
    options?: unknown
  ): Promise<(() => unknown | Promise<unknown>) | undefined>
}

export type PremiumCloudPocketBaseClient = {
  authStore: {
    isValid: boolean
    record: { id: string } | null
  }
  collection(name: string): PremiumCloudCollectionClient
}

export class PremiumCloudSyncRepository {
  constructor(private readonly client: PremiumCloudPocketBaseClient) {}

  async loadCriticalState(): Promise<PremiumCriticalCloudState> {
    const [tagCollectionRecords, booruRecords, blockListRecords] = await Promise.all([
      this.listTagCollections(),
      this.listBoorus(),
      this.listBlockLists()
    ])

    return {
      tagCollections: tagCollectionsFromCloudRecords(tagCollectionRecords),
      boorus: [...booruRecords],
      blockList: [...blockListRecords],
      shouldSubscribe: Boolean(tagCollectionRecords.length || booruRecords.length || blockListRecords.length)
    }
  }

  async saveTagCollections(tagCollections: readonly ITagCollection[]) {
    const records = await this.listTagCollections()
    const payloads = tagCollectionPayloadsFromState(this.userId, tagCollections)

    await this.replaceRecords(premiumCloudCollections.tagCollections, records, payloads, (record) => record.name)
  }

  async saveBoorus(boorus: readonly Domain[]) {
    const records = await this.listBoorus()
    const payloads = booruPayloadsFromState(this.userId, boorus)

    await this.replaceRecords(premiumCloudCollections.boorus, records, payloads, (record) => record.domain)
  }

  async saveCustomBlockList(tags: readonly string[]) {
    const records = await this.listBlockLists()
    const payload = customBlockListPayloadFromState(this.userId, tags)
    const collection = this.client.collection(premiumCloudCollections.blocklists)
    const [record] = records

    if (record) {
      await collection.update(record.id, payload)
      return
    }

    await collection.create(payload)
  }

  async deleteCloudData() {
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

  async subscribeToCriticalChanges(onChange: () => unknown | Promise<unknown>) {
    const unsubscriptions = await Promise.all([
      this.subscribeToCollection(premiumCloudCollections.tagCollections, onChange),
      this.subscribeToCollection(premiumCloudCollections.boorus, onChange),
      this.subscribeToCollection(premiumCloudCollections.blocklists, onChange)
    ])

    return async () => {
      await Promise.all(unsubscriptions.map((unsubscribe) => unsubscribe?.()))
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
    keyFromRecord: (record: TRecord) => string
  ) {
    const collection = this.client.collection(collectionName)
    const recordsByKey = new Map(records.map((record) => [keyFromRecord(record), record]))
    const matchedRecords = new Set<TRecord>()
    const updates: Array<{ record: TRecord; payload: TPayload }> = []
    const creates: TPayload[] = []

    for (const [position, payload] of payloads.entries()) {
      const payloadKey = String(payload[this.keyField(collectionName)])
      const recordByKey = recordsByKey.get(payloadKey)
      const recordByPosition = records[position]
      const record = recordByKey && !matchedRecords.has(recordByKey) ? recordByKey : recordByPosition

      if (record && !matchedRecords.has(record)) {
        matchedRecords.add(record)
        updates.push({ record, payload })
      } else {
        creates.push(payload)
      }
    }

    for (const record of records) {
      if (!matchedRecords.has(record)) {
        await collection.delete(record.id)
      }
    }

    for (const { record, payload } of updates) {
      await collection.update(record.id, payload)
    }

    for (const payload of creates) {
      await collection.create(payload)
    }
  }

  private keyField(collectionName: string) {
    if (collectionName === premiumCloudCollections.boorus) {
      return 'domain'
    }

    return 'name'
  }

  private async subscribeToCollection(collectionName: string, onChange: () => unknown | Promise<unknown>) {
    const collection = this.client.collection(collectionName)

    if (!collection.subscribe) {
      return undefined
    }

    return collection.subscribe('*', onChange)
  }

  private async deleteCollectionRecords(collectionName: string) {
    const collection = this.client.collection(collectionName)
    const records = await collection.getFullList<{ id: string }>({ fields: 'id' })

    for (const record of records) {
      await collection.delete(record.id)
    }
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
    position
  }))
}

export function booruPayloadsFromState(userId: string, boorus: readonly Domain[]): PremiumBooruPayload[] {
  return boorus.map((booru, position) => ({
    user_id: userId,
    domain: booru.domain,
    type: booru.type.type,
    config: booru.config,
    position
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
