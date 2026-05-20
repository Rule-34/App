import type { Domain } from '~/assets/js/domain'
import type { IOldBackupBooru, IOldBackupTagCollection } from '~/assets/js/oldBackup'
import type { ITagCollection } from '~/assets/js/tagCollection.dto'
import { booruTypeList } from '~/assets/lib/rule-34-shared-resources/src/util/BooruUtils'

export interface IBackupState {
  version: number

  boorus: Domain[]
  tag_collections: ITagCollection[]

  settings: Partial<{
    postFullSizeImages: boolean
    postsPerPage: number
    autoplayAnimatedMedia: boolean
  }>
}

export async function createBackupState(): Promise<IBackupState> {
  const { userBooruList } = useBooruList()
  const { tagCollections } = useTagCollections()
  const { postFullSizeImages, postsPerPage, autoplayAnimatedMedia } = useUserSettings()

  // TODO: Only save data that is not defaulted

  const backupState: IBackupState = {
    version: 1,

    boorus: userBooruList.value,
    tag_collections: tagCollections.value,

    settings: {
      postFullSizeImages: postFullSizeImages.value,
      postsPerPage: postsPerPage.value,
      autoplayAnimatedMedia: autoplayAnimatedMedia.value
    }
  }

  return backupState
}

async function restoreV3Backup(backupState: IBackupState) {
  if (backupState.boorus?.length) {
    const { userBooruList } = useBooruList()

    userBooruList.value = backupState.boorus
  }

  if (backupState.tag_collections?.length) {
    const { tagCollections } = useTagCollections()

    tagCollections.value = backupState.tag_collections
  }

  if (backupState.settings) {
    const { postFullSizeImages, postsPerPage, autoplayAnimatedMedia } = useUserSettings()

    if (backupState.settings.postFullSizeImages != null) {
      postFullSizeImages.value = backupState.settings.postFullSizeImages
    }

    if (backupState.settings.postsPerPage != null) {
      postsPerPage.value = backupState.settings.postsPerPage
    }

    if (backupState.settings.autoplayAnimatedMedia != null) {
      autoplayAnimatedMedia.value = backupState.settings.autoplayAnimatedMedia
    }
  }
}

type RestorableOldBackupState = {
  user: {
    custom: {
      boorus?: IOldBackupBooru[]
      tagCollections?: IOldBackupTagCollection[]
    }
  }
}

function restoreV2Backup(backupState: RestorableOldBackupState) {
  if (backupState.user.custom.boorus?.length) {
    const { userBooruList } = useBooruList()

    const migratedBooruList: Domain[] = backupState.user.custom.boorus.map((booru) => {
      const booruType = booruTypeList.find((type) => type.type === booru.type)

      if (!booruType) {
        throw new Error(`Unknown booru type "${booru.type}" in backup`)
      }

      return {
        domain: booru.domain,

        type: booruType,

        config: booru.config ?? null,

        // Doesnt matter if its Premium or not, API is protected
        isPremium: false,
        isCustom: true
      }
    })

    userBooruList.value = migratedBooruList
  }

  if (backupState.user.custom.tagCollections?.length) {
    const { tagCollections } = useTagCollections()

    tagCollections.value = backupState.user.custom.tagCollections
  }

  // TODO: Restore settings
}

/**
 * Attempts to restore a backup, either from the old (<V2) or current (>V3) app version format
 * Destroys the current data
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isOldBackupBooru(value: unknown): value is IOldBackupBooru {
  return (
    isRecord(value) &&
    typeof value.domain === 'string' &&
    typeof value.type === 'string' &&
    (value.config === undefined || isRecord(value.config))
  )
}

function isOldBackupTagCollection(value: unknown): value is IOldBackupTagCollection {
  return (
    isRecord(value) &&
    typeof value.name === 'string' &&
    Array.isArray(value.tags) &&
    value.tags.every((tag) => typeof tag === 'string')
  )
}

function isOldBackupState(value: unknown): value is RestorableOldBackupState {
  if (!isRecord(value) || !isRecord(value.user) || !isRecord(value.user.custom)) {
    return false
  }

  const { boorus, tagCollections } = value.user.custom

  return (
    (boorus === undefined || (Array.isArray(boorus) && boorus.every(isOldBackupBooru))) &&
    (tagCollections === undefined || (Array.isArray(tagCollections) && tagCollections.every(isOldBackupTagCollection)))
  )
}

function isBackupState(value: unknown): value is IBackupState {
  return (
    isRecord(value) &&
    value.version === 1 &&
    Array.isArray(value.boorus) &&
    Array.isArray(value.tag_collections) &&
    isRecord(value.settings)
  )
}

export async function tryToRestoreV2OrV3Backup(backup: unknown): Promise<void> {
  if (!isRecord(backup)) {
    throw new Error('Invalid backup file')
  }

  // V2 Version check
  if (isOldBackupState(backup)) {
    restoreV2Backup(backup)
    return
  }

  // V3 Version check
  if (!isBackupState(backup)) {
    throw new Error('Backup version not supported')
  }

  // TODO: Verify object with Zod

  await restoreV3Backup(backup)
}
