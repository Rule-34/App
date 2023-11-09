import { db as postsDb, type ISavedPost } from '~/store/SavedPosts'
import type { ITagCollection } from '~/assets/js/tagCollection.dto'
import type { VuexUser } from '~/assets/js/oldLocalStorage.dto'
import { union } from 'lodash-es'
import type { Domain } from '~/assets/js/domain'
import { booruTypeList } from '~/assets/lib/rule-34-shared-resources/src/util/BooruUtils'

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

    if (backupState.settings.navigationTouchGestures)
      userSettings.navigationTouchGestures = backupState.settings.navigationTouchGestures

    if (backupState.settings.postFullSizeImages)
      userSettings.postFullSizeImages = backupState.settings.postFullSizeImages

    if (backupState.settings.postsPerPage)
      userSettings.postsPerPage = backupState.settings.postsPerPage

    if (backupState.settings.lastPostsPage)
      userSettings.lastPostsPage = backupState.settings.lastPostsPage

  }
}

export function doesHaveOldVersionState(): boolean {
  if (localStorage.getItem('vuex-user'))
    return true

  return false
}

export function migrateOldVersionState(): void {
  const { tagCollections } = useTagCollections()
  const userSettings = useUserSettings()
  const { booruList } = useBooruList()

  if (!localStorage.getItem('vuex-user')) {
    return
  }

  const vuexUser: VuexUser = JSON.parse(localStorage.getItem('vuex-user')!)

  // Migrate settings
  if (vuexUser.settings.touchGestures)
    userSettings.navigationTouchGestures = vuexUser.settings.touchGestures.value

  if (vuexUser.settings.fullSizeImages)
    userSettings.postFullSizeImages = vuexUser.settings.fullSizeImages.value

  if (vuexUser.settings.postsPerPage)
    userSettings.postsPerPage = vuexUser.settings.postsPerPage.value

  // Migrate tag collections
  if (vuexUser.custom.tagCollections) {
    tagCollections.value = union(tagCollections.value, vuexUser.custom.tagCollections)
  }

  // Migrate Boorus
  const vuexUserBoorusMigrated = vuexUser.custom.boorus.map(booru => {
    // TODO: Find defaults and return that

    return {
      domain: booru.domain,

      type: booruTypeList.find(type => type.type === booru.type),

      isPremium: true
    }
  }) as Domain[]

  booruList.value = union(booruList.value, vuexUserBoorusMigrated)

  // Migrate saved posts


  localStorage.removeItem('vuex-user')
}
