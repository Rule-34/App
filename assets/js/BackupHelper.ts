import { db as postsDb, type ISavedPost } from '~/store/SavedPosts'
import type { ITagCollection } from '~/assets/js/tagCollection.dto'
import type { VuexUser } from '~/assets/js/oldLocalStorage.dto'
import { cloneDeep, toLower, union, unionWith } from 'lodash-es'
import type { Domain } from '~/assets/js/domain'
import { booruTypeList } from '~/assets/lib/rule-34-shared-resources/src/util/BooruUtils'
import type { IPost } from '~/assets/js/post'
import type { IOldBackupState } from '~/assets/js/oldBackup'

export interface IBackupState {
  version: number

  boorus: Domain[]
  tag_collections: ITagCollection[]
  saved_posts: ISavedPost[]

  settings: {
    [key: string]: any
  }
}

export async function createBackupState(): Promise<IBackupState> {
  const { booruList } = useBooruList()
  const { tagCollections } = useTagCollections()
  const savedPosts = await postsDb.posts.toArray()
  const userSettings = useUserSettings()

  // TODO: Only save data that is not defaulted

  const backupState: IBackupState = {
    version: 1,

    boorus: booruList.value,
    tag_collections: tagCollections.value,
    saved_posts: savedPosts,

    settings: userSettings
  }

  return backupState
}

async function restoreV3Backup(backupState: IBackupState) {
  if (backupState.boorus?.length) {
    const { booruList } = useBooruList()

    booruList.value = backupState.boorus
  }

  if (backupState.tag_collections?.length) {
    const { tagCollections } = useTagCollections()

    tagCollections.value = backupState.tag_collections
  }

  if (backupState.saved_posts?.length) {
    const { posts } = postsDb

    await posts.clear()

    await posts.bulkAdd(backupState.saved_posts)
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
    const { booruList } = useBooruList()

    const migratedBooruList: Domain[] = backupState.user.custom.boorus.map((booru) => {
      return {
        domain: booru.domain,

        type: booruTypeList.find((type) => type.type === booru.type) as Domain['type'],

        config: booru.config,

        // Doesnt matter if its Premium or not, API is protected
        isPremium: false
      }
    })

    booruList.value = migratedBooruList
  }

  if (backupState.user.custom.tagCollections?.length) {
    const { tagCollections } = useTagCollections()

    tagCollections.value = backupState.user.custom.tagCollections
  }

  if (backupState.user.custom.savedPosts?.length) {
    const { posts } = postsDb

    const oldSavedPostsAsNewSavedPosts = backupState.user.custom.savedPosts.map((oldSavedPost) => {
      // Restore date too

      const newSavedPost: ISavedPost = {
        original_id: oldSavedPost.data.id,
        original_domain: oldSavedPost.meta_data.booru_domain,

        data: {
          id: oldSavedPost.data.id,

          score: oldSavedPost.data.score,

          high_res_file: oldSavedPost.data.high_res_file,
          low_res_file: oldSavedPost.data.low_res_file,
          preview_file: oldSavedPost.data.preview_file,

          tags: oldSavedPost.data.tags,

          rating: oldSavedPost.data.rating,

          media_type: oldSavedPost.data.media_type as IPost['media_type'],

          sources: oldSavedPost.data.sources
        }
      }

      return newSavedPost
    })

    posts.clear()

    posts.bulkAdd(oldSavedPostsAsNewSavedPosts)
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

export function doesBrowserHaveOldVersionState(): boolean {
  if (localStorage.getItem('vuex-user')) {
    return true
  }

  return false
}

export function removeBrowserOldVersionState() {
  localStorage.removeItem('vuex-root')
  localStorage.removeItem('vuex-user')
  localStorage.removeItem('vuex-booru')
  localStorage.removeItem('vuex-notifications')
}

/**
 * Migrates the old (V2) browser state to the new one (V3)
 * Merges the data
 */
export async function migrateBrowserOldVersionState(): Promise<void> {
  const { tagCollections } = useTagCollections()
  const userSettings = useUserSettings()
  const { booruList } = useBooruList()

  if (!doesBrowserHaveOldVersionState()) {
    return
  }

  const vuexUser: VuexUser = JSON.parse(localStorage.getItem('vuex-user')!)

  // === Migrate settings
  if (vuexUser.user.settings.fullSizeImages)
    userSettings.postFullSizeImages = vuexUser.user.settings.fullSizeImages.value

  if (vuexUser.user.settings.postsPerPage) userSettings.postsPerPage = vuexUser.user.settings.postsPerPage.value

  // === Migrate tag collections
  if (vuexUser.user.custom.tagCollections?.length) {
    tagCollections.value = mergeBlocklists(tagCollections.value, vuexUser.user.custom.tagCollections)
  }

  // === Migrate Boorus
  if (vuexUser.user.custom.boorus?.length) {
    const vuexUserBoorusMigrated = vuexUser.user.custom.boorus.map((booru) => {
      return {
        domain: booru.domain,

        type: booruTypeList.find((type) => type.type === booru.type),

        config: booru.config,

        // Doesnt matter if its Premium or not, API is protected
        isPremium: false
      }
    }) as Domain[]

    const uniqueBoorus = unionWith(booruList.value, vuexUserBoorusMigrated, (obj1, obj2) => {
      return obj1.domain === obj2.domain
    })

    booruList.value = uniqueBoorus
  }

  // === Migrate saved posts
  if (vuexUser.user.custom.savedPosts?.length) {
    const { posts } = postsDb

    const oldSavedPostsAsNewSavedPosts = vuexUser.user.custom.savedPosts.map((oldSavedPost) => {
      const newSavedPost: ISavedPost = {
        original_id: oldSavedPost.data.id,
        original_domain: oldSavedPost.meta_data.booru_domain,

        data: {
          id: oldSavedPost.data.id,

          score: oldSavedPost.data.score,

          high_res_file: oldSavedPost.data.high_res_file,
          low_res_file: oldSavedPost.data.low_res_file,
          preview_file: oldSavedPost.data.preview_file,

          tags: oldSavedPost.data.tags,

          rating: oldSavedPost.data.rating,

          media_type: oldSavedPost.data.media_type as IPost['media_type'],

          sources: oldSavedPost.data.sources
        }
      }

      return newSavedPost
    })

    await posts.clear()

    await posts.bulkAdd(oldSavedPostsAsNewSavedPosts)
  }

  removeBrowserOldVersionState()
}

function mergeTags(tags1: string[], tags2: string[]): string[] {
  return union(tags1, tags2)
}

function mergeBlocklists(list1: ITagCollection[], list2: ITagCollection[]): ITagCollection[] {
  const mergedList: ITagCollection[] = cloneDeep(list1)

  list2.forEach((item2) => {
    const existingItem = mergedList.find((item1) => toLower(item1.name) === toLower(item2.name))

    // If an item with the same name exists, merge their tags
    if (existingItem) {
      existingItem.tags = mergeTags(existingItem.tags, item2.tags)

      // Otherwise, add the new item to the merged list
    } else {
      mergedList.push(item2)
    }
  })

  return mergedList
}
