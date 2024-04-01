import type { Domain } from '~/assets/js/domain'
import type { IOldBackupState } from '~/assets/js/oldBackup'
import type { ITagCollection } from '~/assets/js/tagCollection.dto'
import { booruTypeList } from '~/assets/lib/rule-34-shared-resources/src/util/BooruUtils'

export interface IBackupState {
  version: number

  boorus: Domain[]
  tag_collections: ITagCollection[]

  settings: {
    [key: string]: any
  }
}

export async function createBackupState(): Promise<IBackupState> {
  const { userBooruList } = useBooruList()
  const { tagCollections } = useTagCollections()
  const userSettings = useUserSettings()

  // TODO: Only save data that is not defaulted

  const backupState: IBackupState = {
    version: 1,

    boorus: userBooruList.value,
    tag_collections: tagCollections.value,

    settings: userSettings
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
    const userSettings = useUserSettings()

    if (backupState.settings.postFullSizeImages) {
      userSettings.postFullSizeImages = backupState.settings.postFullSizeImages
    }

    if (backupState.settings.postsPerPage) {
      userSettings.postsPerPage = backupState.settings.postsPerPage
    }
  }
}

function restoreV2Backup(backupState: IOldBackupState) {
  if (backupState.user.custom.boorus?.length) {
    const { userBooruList } = useBooruList()

    const migratedBooruList: Domain[] = backupState.user.custom.boorus.map((booru) => {
      return {
        domain: booru.domain,

        type: booruTypeList.find((type) => type.type === booru.type) as Domain['type'],

        config: booru.config,

        // Doesnt matter if its Premium or not, API is protected
        isPremium: false
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
export async function tryToRestoreV2OrV3Backup(backup: any): Promise<void> {
  // V2 Version check
  if ('user' in backup && 'custom' in backup.user) {
    restoreV2Backup(backup)
  }

  // V3 Version check
  if (backup.version !== 1) {
    throw new Error('Backup version not supported')
  }

  // TODO: Verify object with Zod

  await restoreV3Backup(backup)
}
