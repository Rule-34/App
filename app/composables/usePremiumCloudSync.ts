import { booruTypeList } from '~/assets/lib/rule-34-shared-resources/src/util/BooruUtils'
import {
  PremiumCloudSyncRepository,
  type PremiumBooruRecord,
  type PremiumCloudPocketBaseClient
} from '~/assets/js/PremiumCloudSync'
import { createLatestAsyncQueue } from '~/assets/js/AsyncSaveQueue'
import type { Domain } from '~/assets/js/domain'
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

let refreshFromCloudTimeout: ReturnType<typeof setTimeout> | null = null
const saveTagCollectionsToCloud = createLatestAsyncQueue((save: () => Promise<void>) => save())
const saveBoorusToCloud = createLatestAsyncQueue((save: () => Promise<void>) => save())

export default function () {
  const nuxtApp = useNuxtApp()
  const $i18n = nuxtApp.$i18n as Composer
  const { $pocketBase } = nuxtApp
  const { toast } = useLazyToast()
  const { tagCollections, resetTagCollections } = useTagCollections()
  const { userBooruList, resetUserBooruList } = useBooruList()
  const { customBlockList, selectedList } = useBlockLists()
  const { savedPostList } = usePocketbase()

  const runtime = useState<PremiumCloudSyncRuntime>('premium-cloud-sync-runtime', defaultRuntime)
  runtime.value.cloudBacked ??= defaultRuntime().cloudBacked

  const repository = computed(
    () => new PremiumCloudSyncRepository($pocketBase as unknown as PremiumCloudPocketBaseClient)
  )

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
    const cloudState = await repository.value.loadCriticalState()

    if (cloudState.tagCollections.length) {
      tagCollections.value = cloudState.tagCollections
      runtime.value.cloudBacked.tagCollections = true
    }

    if (cloudState.boorus.length) {
      userBooruList.value = booruRecordsToDomains(cloudState.boorus)
      runtime.value.cloudBacked.boorus = true
    }

    const [blockListRecord] = cloudState.blockList

    if (blockListRecord) {
      customBlockList.value = [...blockListRecord.tags]
      runtime.value.cloudBacked.blockList = true
    }

    runtime.value.initialized = true
    await tryEnsureRealtimeSubscription()
  }

  async function refreshFromCloud() {
    if (import.meta.server || !$pocketBase.authStore.isValid) {
      return
    }

    const cloudState = await repository.value.loadCriticalState()

    if (cloudState.tagCollections.length) {
      tagCollections.value = cloudState.tagCollections
      runtime.value.cloudBacked.tagCollections = true
    } else if (runtime.value.cloudBacked.tagCollections) {
      resetTagCollections()
      runtime.value.cloudBacked.tagCollections = false
    }

    if (cloudState.boorus.length) {
      userBooruList.value = booruRecordsToDomains(cloudState.boorus)
      runtime.value.cloudBacked.boorus = true
    } else if (runtime.value.cloudBacked.boorus) {
      userBooruList.value = []
      runtime.value.cloudBacked.boorus = false
    }

    const [blockListRecord] = cloudState.blockList

    if (blockListRecord) {
      customBlockList.value = [...blockListRecord.tags]
      runtime.value.cloudBacked.blockList = true
    } else if (runtime.value.cloudBacked.blockList) {
      customBlockList.value = []
      runtime.value.cloudBacked.blockList = false
    }
  }

  async function setTagCollections(nextTagCollections: ITagCollection[]) {
    tagCollections.value = nextTagCollections

    return withCloudSyncFailureToast(async () => {
      if (!(await canWriteToCloud())) {
        return true
      }

      await saveTagCollectionsToCloud(async () => {
        await repository.value.saveTagCollections(nextTagCollections)
        runtime.value.cloudBacked.tagCollections = true
        await tryEnsureRealtimeSubscription()
      })
      return true
    })
  }

  async function resetTagCollectionsCloud() {
    return withCloudSyncFailureToast(async () => {
      if (!(await canWriteToCloud())) {
        resetTagCollections()
        return true
      }

      await repository.value.clearTagCollections()
      resetTagCollections()
      runtime.value.cloudBacked.tagCollections = false
      return true
    })
  }

  async function setUserBooruList(nextBoorus: Domain[]) {
    userBooruList.value = nextBoorus

    return withCloudSyncFailureToast(async () => {
      if (!(await canWriteToCloud())) {
        return true
      }

      await saveBoorusToCloud(async () => {
        await repository.value.saveBoorus(nextBoorus)
        runtime.value.cloudBacked.boorus = true
        await tryEnsureRealtimeSubscription()
      })
      return true
    })
  }

  async function resetUserBooruListCloud() {
    return withCloudSyncFailureToast(async () => {
      if (!(await canWriteToCloud())) {
        resetUserBooruList()
        return true
      }

      await repository.value.clearBoorus()
      resetUserBooruList()
      runtime.value.cloudBacked.boorus = false
      return true
    })
  }

  async function setCustomBlockList(nextTags: string[]) {
    return withCloudSyncFailureToast(async () => {
      if (!(await canWriteToCloud())) {
        customBlockList.value = nextTags
        return true
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
    if (runtime.value.subscribed || !$pocketBase.authStore.isValid) {
      return
    }

    await repository.value.subscribeToCriticalChanges(queueRefreshFromCloud)
    runtime.value.subscribed = true
  }

  function queueRefreshFromCloud() {
    if (refreshFromCloudTimeout) {
      return
    }

    refreshFromCloudTimeout = setTimeout(() => {
      refreshFromCloudTimeout = null
      void refreshFromCloud().catch((error) => {
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
    savedPostList.value = []
    resetTagCollections()
    resetUserBooruList()
    selectedList.value = 'none' as typeof selectedList.value
    customBlockList.value = []
    runtime.value.cloudBacked = defaultRuntime().cloudBacked
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
    refreshFromCloud,
    setTagCollections,
    resetTagCollectionsCloud,
    setUserBooruList,
    resetUserBooruListCloud,
    setCustomBlockList,
    deleteCloudData,
    deleteAccount
  }
}
