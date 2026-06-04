import { booruTypeList } from '~/assets/lib/rule-34-shared-resources/src/util/BooruUtils'
import { useQueryClient } from '@tanstack/vue-query'
import {
  createLatestAsyncQueue,
  PremiumCloudRepository,
  type PremiumBlockListRecord,
  type PremiumBooruRecord,
  type PremiumCloudPocketBaseClient
} from '~/repositories/PremiumCloudRepository'
import type { Domain } from '~/assets/js/domain'
import type { IPost } from '~/assets/js/post.dto'
import type { ISimplePocketbasePost } from '~/assets/js/pocketbase.dto'
import type { ITagCollection } from '~/assets/js/tagCollection.dto'
import type { Composer } from 'vue-i18n'

type PremiumCloudSyncRuntime = {
  initializing: Promise<void> | null
  initialized: boolean
  subscribed: boolean
  cloudBacked: {
    tagCollections: boolean
    boorus: boolean
    blockList: boolean
  }
}

type PremiumCloudRefreshKey = 'tagCollections' | 'boorus' | 'blockList'

const defaultRuntime = (): PremiumCloudSyncRuntime => ({
  initializing: null,
  initialized: false,
  subscribed: false,
  cloudBacked: {
    tagCollections: false,
    boorus: false,
    blockList: false
  }
})

const refreshFromCloudTimeouts: Record<PremiumCloudRefreshKey, ReturnType<typeof setTimeout> | null> = {
  tagCollections: null,
  boorus: null,
  blockList: null
}
let realtimeUnsubscribe: (() => unknown | Promise<unknown>) | null = null
const saveTagCollectionsToCloud = createLatestAsyncQueue(
  (save: (isCurrent: () => boolean) => Promise<void>, isCurrent) => save(isCurrent)
)
const saveBoorusToCloud = createLatestAsyncQueue((save: (isCurrent: () => boolean) => Promise<void>, isCurrent) =>
  save(isCurrent)
)

export default function () {
  const nuxtApp = useNuxtApp()
  const $i18n = nuxtApp.$i18n as Composer
  const { $pocketBase } = nuxtApp
  const queryClient = useQueryClient()
  const { toast } = useLazyToast()
  const { tagCollections, resetTagCollections } = useTagCollections()
  const { userBooruList, resetUserBooruList } = useBooruList()
  const { customBlockList } = useBlockLists()
  const savedPostList = useState<ISimplePocketbasePost[]>('premium-saved-post-list', () => [])

  const runtime = useState<PremiumCloudSyncRuntime>('premium-cloud-sync-runtime', defaultRuntime)
  const isInitialized = computed(() => runtime.value.initialized)

  const repository = computed(() => new PremiumCloudRepository($pocketBase as unknown as PremiumCloudPocketBaseClient))

  async function initialize() {
    if (import.meta.server || !$pocketBase.authStore.isValid) {
      return
    }

    if (runtime.value.initialized) {
      return
    }

    if (runtime.value.initializing) {
      return runtime.value.initializing
    }

    runtime.value.initializing = initializeSync()

    try {
      await runtime.value.initializing
    } finally {
      runtime.value.initializing = null
    }
  }

  async function initializeInBackground() {
    try {
      await initialize()
    } catch (error) {
      console.error('Failed to initialize premium cloud sync', error)
    }
  }

  async function initializeSync() {
    const cloudState = await repository.value.loadPremiumCloudState()

    applySavedPostsFromCloud(cloudState.savedPosts)
    applyTagCollectionsFromCloud(cloudState.tagCollections, false)
    applyBoorusFromCloud(cloudState.boorus, false)
    applyBlockListFromCloud(cloudState.blockList, false)

    runtime.value.initialized = true
    await tryEnsureRealtimeSubscription()
  }

  async function refreshTagCollectionsFromCloud() {
    applyTagCollectionsFromCloud(await repository.value.loadTagCollections(), true)
  }

  async function refreshBoorusFromCloud() {
    applyBoorusFromCloud(await repository.value.loadBoorus(), true)
  }

  async function refreshBlockListFromCloud() {
    applyBlockListFromCloud(await repository.value.loadBlockList(), true)
  }

  async function setTagCollections(nextTagCollections: ITagCollection[]) {
    return withCloudSyncFailureToast(async () => {
      if (!(await canWriteToCloud())) {
        return false
      }

      await saveTagCollectionsToCloud(async (isCurrent) => {
        if (!isCurrent()) {
          return
        }

        await repository.value.saveTagCollections(nextTagCollections)

        if (!isCurrent()) {
          return
        }

        tagCollections.value = nextTagCollections
        runtime.value.cloudBacked.tagCollections = true
        await tryEnsureRealtimeSubscription()
      })
      return true
    })
  }

  async function resetTagCollectionsCloud() {
    return withCloudSyncFailureToast(async () => {
      if (!(await canWriteToCloud())) {
        return false
      }

      await repository.value.clearTagCollections()
      resetTagCollections()
      runtime.value.cloudBacked.tagCollections = false
      return true
    })
  }

  async function setUserBooruList(nextBoorus: Domain[]) {
    return withCloudSyncFailureToast(async () => {
      if (!(await canWriteToCloud())) {
        return false
      }

      await saveBoorusToCloud(async (isCurrent) => {
        if (!isCurrent()) {
          return
        }

        await repository.value.saveBoorus(nextBoorus)

        if (!isCurrent()) {
          return
        }

        userBooruList.value = nextBoorus
        runtime.value.cloudBacked.boorus = true
        await tryEnsureRealtimeSubscription()
      })
      return true
    })
  }

  async function resetUserBooruListCloud() {
    return withCloudSyncFailureToast(async () => {
      if (!(await canWriteToCloud())) {
        return false
      }

      await repository.value.clearBoorus()
      resetUserBooruList()
      runtime.value.cloudBacked.boorus = false
      return true
    })
  }

  async function savePost(post: IPost) {
    return withCloudSyncFailureToast(async () => {
      if (!(await canWriteToCloud())) {
        return false
      }

      const savedPost = await repository.value.savePost(post)
      upsertSavedPost(savedPost)
      clearInactiveSavedPostsQueries()
      await tryEnsureRealtimeSubscription()
      return true
    })
  }

  async function deleteSavedPost(id: string) {
    return withCloudSyncFailureToast(async () => {
      if (!(await canWriteToCloud())) {
        return false
      }

      await repository.value.deleteSavedPost(id)
      removeSavedPost(id)
      await tryEnsureRealtimeSubscription()
      return true
    })
  }

  async function setCustomBlockList(nextTags: string[]) {
    return withCloudSyncFailureToast(async () => {
      if (!(await canWriteToCloud())) {
        return false
      }

      await repository.value.saveCustomBlockList(nextTags)
      customBlockList.value = nextTags
      runtime.value.cloudBacked.blockList = true
      await tryEnsureRealtimeSubscription()
      return true
    })
  }

  async function deleteCloudData() {
    return withCloudSyncFailureToast(async () => {
      await repository.value.deleteCloudData()
      clearSyncedLocalState()
      return true
    })
  }

  async function deleteAccount() {
    return withCloudSyncFailureToast(async () => {
      await repository.value.deleteAccount()
      clearSyncedLocalState()
      $pocketBase.authStore.clear()
      return true
    })
  }

  async function withCloudSyncFailureToast(action: () => Promise<boolean>) {
    try {
      return await action()
    } catch (error) {
      toast.error($i18n.t('toasts.cloudSyncFailed', { error: errorToMessage(error) }))
      return false
    }
  }

  async function canWriteToCloud() {
    if (import.meta.server || !$pocketBase.authStore.isValid) {
      return false
    }

    await initialize()

    return true
  }

  async function ensureRealtimeSubscription() {
    if (!$pocketBase.authStore.isValid) {
      await clearRealtimeSubscription()
      return
    }

    if (runtime.value.subscribed && realtimeUnsubscribe) {
      return
    }

    await clearRealtimeSubscription()
    realtimeUnsubscribe = await repository.value.subscribeToPremiumCloudChanges({
      savedPosts: handleSavedPostsRealtimeChange,
      tagCollections: () => queueRefreshFromCloud('tagCollections', refreshTagCollectionsFromCloud),
      boorus: () => queueRefreshFromCloud('boorus', refreshBoorusFromCloud),
      blockList: () => queueRefreshFromCloud('blockList', refreshBlockListFromCloud)
    })
    runtime.value.subscribed = true
  }

  function queueRefreshFromCloud(key: PremiumCloudRefreshKey, refresh: () => Promise<void>) {
    if (refreshFromCloudTimeouts[key]) {
      return
    }

    refreshFromCloudTimeouts[key] = setTimeout(() => {
      refreshFromCloudTimeouts[key] = null
      void refresh().catch((error) => {
        console.error('Failed to refresh premium cloud sync state', error)
      })
    }, 100)
  }

  async function tryEnsureRealtimeSubscription() {
    try {
      await ensureRealtimeSubscription()
    } catch (error) {
      console.error('Failed to subscribe to premium cloud sync updates', error)
    }
  }

  function clearSyncedLocalState() {
    saveTagCollectionsToCloud.invalidate()
    saveBoorusToCloud.invalidate()
    clearQueuedCloudRefreshes()
    void clearRealtimeSubscription()
    savedPostList.value = []
    runtime.value = defaultRuntime()
    resetTagCollections()
    resetUserBooruList()
    customBlockList.value = []
  }

  function clearQueuedCloudRefreshes() {
    for (const key of Object.keys(refreshFromCloudTimeouts) as PremiumCloudRefreshKey[]) {
      const timeout = refreshFromCloudTimeouts[key]

      if (timeout) {
        clearTimeout(timeout)
        refreshFromCloudTimeouts[key] = null
      }
    }
  }

  async function clearRealtimeSubscription() {
    const unsubscribe = realtimeUnsubscribe
    realtimeUnsubscribe = null
    runtime.value.subscribed = false

    if (!unsubscribe) {
      return
    }

    try {
      await unsubscribe()
    } catch (error) {
      console.error('Failed to unsubscribe from premium cloud sync updates', error)
    }
  }

  function applySavedPostsFromCloud(savedPosts: ISimplePocketbasePost[]) {
    savedPostList.value = savedPosts
  }

  function handleSavedPostsRealtimeChange(event: unknown) {
    const savedPostEvent = savedPostRealtimeEvent(event)

    if (!savedPostEvent) {
      return
    }

    if (savedPostEvent.action === 'delete') {
      removeSavedPost(savedPostEvent.savedPost.id)
      return
    }

    upsertSavedPost(savedPostEvent.savedPost)
    clearInactiveSavedPostsQueries()
  }

  function applyTagCollectionsFromCloud(nextTagCollections: ITagCollection[], clearWhenEmpty: boolean) {
    if (nextTagCollections.length) {
      tagCollections.value = nextTagCollections
      runtime.value.cloudBacked.tagCollections = true
    } else if (clearWhenEmpty && runtime.value.cloudBacked.tagCollections) {
      resetTagCollections()
      runtime.value.cloudBacked.tagCollections = false
    }
  }

  function applyBoorusFromCloud(records: PremiumBooruRecord[], clearWhenEmpty: boolean) {
    if (records.length) {
      userBooruList.value = booruRecordsToDomains(records)
      runtime.value.cloudBacked.boorus = true
    } else if (clearWhenEmpty && runtime.value.cloudBacked.boorus) {
      userBooruList.value = []
      runtime.value.cloudBacked.boorus = false
    }
  }

  function applyBlockListFromCloud(records: PremiumBlockListRecord[], clearWhenEmpty: boolean) {
    const [blockListRecord] = records

    if (blockListRecord) {
      customBlockList.value = [...blockListRecord.tags]
      runtime.value.cloudBacked.blockList = true
    } else if (clearWhenEmpty && runtime.value.cloudBacked.blockList) {
      customBlockList.value = []
      runtime.value.cloudBacked.blockList = false
    }
  }

  function upsertSavedPost(savedPost: ISimplePocketbasePost) {
    const index = savedPostList.value.findIndex((existingSavedPost) => existingSavedPost.id === savedPost.id)

    if (index === -1) {
      savedPostList.value = savedPostList.value.concat(savedPost)
    } else {
      savedPostList.value = savedPostList.value.map((existingSavedPost, savedPostIndex) =>
        savedPostIndex === index ? savedPost : existingSavedPost
      )
    }
  }

  function removeSavedPost(id: string) {
    const nextSavedPosts = savedPostList.value.filter((savedPost) => savedPost.id !== id)

    if (nextSavedPosts.length === savedPostList.value.length) {
      return
    }

    savedPostList.value = nextSavedPosts
  }

  function clearInactiveSavedPostsQueries() {
    // If a user visited saved posts while empty, then saves from /posts, the old
    // empty infinite-query cache would otherwise be reused on the next visit.
    // Only clear inactive queries so unsaving inside the saved-posts viewer does
    // not reset the active list or lose scroll/progress.
    queryClient.removeQueries({ queryKey: ['saved-posts'], type: 'inactive' })
  }

  function getSavedPost(post: IPost) {
    if (!runtime.value.initialized) {
      return undefined
    }

    return savedPostList.value.find(
      (savedPost) => savedPost.original_id === post.id && savedPost.original_domain === post.domain
    )
  }

  function booruRecordsToDomains(records: readonly PremiumBooruRecord[]): Domain[] {
    return records.flatMap((record) => {
      const type = booruTypeList.find((booruType) => booruType.type === record.type)

      if (!type) {
        return []
      }

      return {
        domain: record.domain,
        type,
        config: record.config,
        isPremium: true,
        isCustom: true
      }
    })
  }

  function errorToMessage(error: unknown) {
    if (error instanceof Error) {
      return error.message
    }

    return String(error)
  }

  return {
    initialize,
    initializeInBackground,
    isInitialized,

    savedPostList,
    getSavedPost,

    savePost,
    deleteSavedPost,

    setTagCollections,
    resetTagCollectionsCloud,

    setUserBooruList,
    resetUserBooruListCloud,

    setCustomBlockList,

    deleteCloudData,
    deleteAccount
  }
}

function savedPostRealtimeEvent(event: unknown) {
  if (!event || typeof event !== 'object') {
    return null
  }

  const { action, record } = event as { action?: unknown; record?: unknown }

  if (action !== 'create' && action !== 'update' && action !== 'delete') {
    return null
  }

  if (!record || typeof record !== 'object') {
    return null
  }

  const { id, original_id, original_domain } = record as Partial<ISimplePocketbasePost>

  if (typeof id !== 'string' || typeof original_id !== 'number' || typeof original_domain !== 'string') {
    return null
  }

  return {
    action,
    savedPost: {
      id,
      original_id,
      original_domain
    }
  }
}
