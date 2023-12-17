import { db as postsDb, type ISavedPost } from '~/store/SavedPosts'
import type { ITagCollection } from '~/assets/js/tagCollection.dto'
import type { VuexUser } from '~/assets/js/oldLocalStorage.dto'
import { cloneDeep, toLower, union, unionWith } from 'lodash-es'
import type { Domain } from '~/assets/js/domain'
import { booruTypeList } from '~/assets/lib/rule-34-shared-resources/src/util/BooruUtils'
import type { IPost } from '~/assets/js/post'

export interface IBackupState {
  version: number

  saved_posts: ISavedPost[]
  tag_collections: ITagCollection[]

  settings: {
    [key: string]: any
  }
}

export async function createBackupState(): Promise<IBackupState> {
  const savedPosts = await postsDb.posts.toArray()
  const { tagCollections } = useTagCollections()
  const userSettings = useUserSettings()

  // TODO: Only save data that is not defaulted

  const backupState: IBackupState = {
    version: 1,

    saved_posts: savedPosts,
    tag_collections: tagCollections.value,

    settings: userSettings
  }

  return backupState
}

export async function restoreBackupState(backupState: IBackupState): Promise<void> {
  if (backupState.version !== 1) {
    throw new Error('Backup version not supported')
  }

  if (backupState.saved_posts) {
    const { posts } = postsDb

    await posts.clear()

    await posts.bulkAdd(backupState.saved_posts)
  }

  if (backupState.tag_collections) {
    const { tagCollections } = useTagCollections()

    tagCollections.value = backupState.tag_collections
  }

  if (backupState.settings) {
    const userSettings = useUserSettings()

    if (backupState.settings.navigationTouchGestures) {
      userSettings.navigationTouchGestures = backupState.settings.navigationTouchGestures
    }

    if (backupState.settings.postFullSizeImages) {
      userSettings.postFullSizeImages = backupState.settings.postFullSizeImages
    }

    if (backupState.settings.postsPerPage) {
      userSettings.postsPerPage = backupState.settings.postsPerPage
    }
  }
}

export function doesHaveOldVersionState(): boolean {
  if (localStorage.getItem('vuex-user')) {
    return true
  }

  return false
}

export function removeOldVersionState() {
  localStorage.removeItem('vuex-root')
  localStorage.removeItem('vuex-user')
  localStorage.removeItem('vuex-booru')
  localStorage.removeItem('vuex-notifications')
}

export async function migrateOldVersionState(): Promise<void> {
  const { tagCollections } = useTagCollections()
  const userSettings = useUserSettings()
  const { booruList } = useBooruList()

  if (!localStorage.getItem('vuex-user')) {
    return
  }

  const vuexUser: VuexUser = JSON.parse(localStorage.getItem('vuex-user')!)

  // === Migrate settings
  if (vuexUser.user.settings.touchGestures)
    userSettings.navigationTouchGestures = vuexUser.user.settings.touchGestures.value

  if (vuexUser.user.settings.fullSizeImages)
    userSettings.postFullSizeImages = vuexUser.user.settings.fullSizeImages.value

  if (vuexUser.user.settings.postsPerPage) userSettings.postsPerPage = vuexUser.user.settings.postsPerPage.value

  // === Migrate tag collections
  if (vuexUser.user.custom.tagCollections?.length) {
    tagCollections.value = mergeBlocklists(tagCollections.value, vuexUser.user.custom.tagCollections)
  }

  // === Migrate Boorus
  if (!vuexUser.user.custom.boorus?.length) {
    const vuexUserBoorusMigrated = vuexUser.user.custom.boorus.map((booru) => {
      return {
        domain: booru.domain,

        type: booruTypeList.find((type) => type.type === booru.type),

        config: booru.config,

        isPremium: true
      }
    }) as Domain[]

    booruList.value = unionWith(booruList.value, vuexUserBoorusMigrated, (obj1, obj2) => {
      return obj1.domain === obj2.domain
    })
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

    await posts.bulkAdd(oldSavedPostsAsNewSavedPosts)
  }

  removeOldVersionState()
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
