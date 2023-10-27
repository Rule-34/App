import { db as postsDb, ISavedPost } from '~/store/SavedPosts'
import { ITagCollection } from 'assets/js/tagCollection.dto'

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
