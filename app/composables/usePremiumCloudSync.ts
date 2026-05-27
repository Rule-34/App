import { booruTypeList } from '~/assets/lib/rule-34-shared-resources/src/util/BooruUtils'
import {
  PremiumCloudSyncRepository,
  resolveCloudRefreshFeatureState,
  type PremiumBooruRecord,
  type PremiumCloudPocketBaseClient
} from '~/assets/js/PremiumCloudSync'
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
  unsubscribe: (() => Promise<void>) | null
}

const defaultRuntime = (): PremiumCloudSyncRuntime => ({
  initializing: null,
  initialized: false,
  subscribed: false,
  cloudBacked: {
    tagCollections: false,
    boorus: false,
    blockList: false
  },
  unsubscribe: null
})

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

    if (cloudState.tagCollections.source === 'cloud') {
      tagCollections.value = cloudState.tagCollections.state
      runtime.value.cloudBacked.tagCollections = true
    }

    if (cloudState.boorus.source === 'cloud') {
      userBooruList.value = booruRecordsToDomains(cloudState.boorus.state)
      runtime.value.cloudBacked.boorus = true
    }

    if (cloudState.blockList.source === 'cloud') {
      const [blockListRecord] = cloudState.blockList.state

      if (blockListRecord) {
        customBlockList.value = [...blockListRecord.tags]
        runtime.value.cloudBacked.blockList = true
      }
    }

    runtime.value.initialized = true

    if (cloudState.shouldSubscribe) {
      await ensureRealtimeSubscription()
    }
  }

  async function refreshFromCloud() {
    if (import.meta.server || !$pocketBase.authStore.isValid) {
      return
    }

    const cloudState = await repository.value.loadCriticalState()
    const nextTagCollectionsState = resolveCloudRefreshFeatureState(
      cloudState.tagCollections,
      runtime.value.cloudBacked.tagCollections,
      []
    )
    const nextBoorusState = resolveCloudRefreshFeatureState(cloudState.boorus, runtime.value.cloudBacked.boorus, [])
    const nextBlockListState = resolveCloudRefreshFeatureState(
      cloudState.blockList,
      runtime.value.cloudBacked.blockList,
      []
    )

    if (nextTagCollectionsState.shouldApply) {
      if (nextTagCollectionsState.cloudBacked) {
        tagCollections.value = nextTagCollectionsState.state
      } else {
        resetTagCollections()
      }
    }

    if (nextBoorusState.shouldApply) {
      userBooruList.value = booruRecordsToDomains(nextBoorusState.state)
    }

    if (nextBlockListState.shouldApply) {
      const [blockListRecord] = nextBlockListState.state

      customBlockList.value = blockListRecord ? [...blockListRecord.tags] : []
    }

    runtime.value.cloudBacked.tagCollections = nextTagCollectionsState.cloudBacked
    runtime.value.cloudBacked.boorus = nextBoorusState.cloudBacked
    runtime.value.cloudBacked.blockList = nextBlockListState.cloudBacked
  }

  async function setTagCollections(nextTagCollections: ITagCollection[]) {
    tagCollections.value = nextTagCollections

    try {
      if (!(await canWriteToCloud())) {
        return true
      }

      await repository.value.saveTagCollections(nextTagCollections)
      tagCollections.value = nextTagCollections
      runtime.value.cloudBacked.tagCollections = true
      await ensureRealtimeSubscription()
      return true
    } catch (error) {
      toast.error($i18n.t('toasts.cloudSyncFailed', { error: errorToMessage(error) }))
      return false
    }
  }

  async function resetTagCollectionsCloud() {
    try {
      if (!(await canWriteToCloud())) {
        resetTagCollections()
        return true
      }

      await repository.value.clearTagCollections()
      resetTagCollections()
      runtime.value.cloudBacked.tagCollections = false
      return true
    } catch (error) {
      toast.error($i18n.t('toasts.cloudSyncFailed', { error: errorToMessage(error) }))
      return false
    }
  }

  async function setUserBooruList(nextBoorus: Domain[]) {
    userBooruList.value = nextBoorus

    try {
      if (!(await canWriteToCloud())) {
        return true
      }

      await repository.value.saveBoorus(nextBoorus)
      userBooruList.value = nextBoorus
      runtime.value.cloudBacked.boorus = true
      await ensureRealtimeSubscription()
      return true
    } catch (error) {
      toast.error($i18n.t('toasts.cloudSyncFailed', { error: errorToMessage(error) }))
      return false
    }
  }

  async function resetUserBooruListCloud() {
    try {
      if (!(await canWriteToCloud())) {
        resetUserBooruList()
        return true
      }

      await repository.value.clearBoorus()
      resetUserBooruList()
      runtime.value.cloudBacked.boorus = false
      return true
    } catch (error) {
      toast.error($i18n.t('toasts.cloudSyncFailed', { error: errorToMessage(error) }))
      return false
    }
  }

  async function setCustomBlockList(nextTags: string[]) {
    try {
      if (!(await canWriteToCloud())) {
        customBlockList.value = nextTags
        return true
      }

      await repository.value.saveCustomBlockList(nextTags)
      customBlockList.value = nextTags
      runtime.value.cloudBacked.blockList = true
      await ensureRealtimeSubscription()
      return true
    } catch (error) {
      toast.error($i18n.t('toasts.cloudSyncFailed', { error: errorToMessage(error) }))
      return false
    }
  }

  async function deleteCloudData() {
    try {
      await repository.value.deleteCloudData()
      savedPostList.value = []
      resetTagCollections()
      resetUserBooruList()
      selectedList.value = 'none' as typeof selectedList.value
      customBlockList.value = []
      runtime.value.cloudBacked.tagCollections = false
      runtime.value.cloudBacked.boorus = false
      runtime.value.cloudBacked.blockList = false
      return true
    } catch (error) {
      toast.error($i18n.t('toasts.cloudSyncFailed', { error: errorToMessage(error) }))
      return false
    }
  }

  async function deleteAccount() {
    try {
      await repository.value.deleteAccount()
      savedPostList.value = []
      resetTagCollections()
      resetUserBooruList()
      selectedList.value = 'none' as typeof selectedList.value
      customBlockList.value = []
      $pocketBase.authStore.clear()
      runtime.value.cloudBacked.tagCollections = false
      runtime.value.cloudBacked.boorus = false
      runtime.value.cloudBacked.blockList = false
      return true
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

    const unsubscribe = await repository.value.subscribeToCriticalChanges(refreshFromCloud)

    runtime.value.unsubscribe = unsubscribe
    runtime.value.subscribed = true
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
