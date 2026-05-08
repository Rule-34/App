import type { ISimplePocketbasePost } from '~/assets/js/pocketbase.dto'

type SavedPostFolderAssignments = Record<string, string>

function buildSavedPostFolderKey(originalDomain: string, originalId: number) {
  return `${originalDomain}:${originalId}`
}

function normalizeSavedPostFolderName(folderName: string) {
  return folderName.trim().replace(/\s+/g, ' ')
}

export default function () {
  const { $pocketBase } = useNuxtApp()

  const email = useState<string | null>('pocketbase-email', () => null)
  const license = useState<string | null>('pocketbase-license', () => null)
  const subscription_expires_at = useState<string | null>('pocketbase-subscription_expires_at', () => null)

  const savedPostList = useLocalState<ISimplePocketbasePost[]>('pocketbase-savedPostList', [])
  const savedPostFolders = useLocalState<string[]>('pocketbase-savedPostFolders', [])
  const savedPostFolderAssignments = useLocalState<SavedPostFolderAssignments>(
    'pocketbase-savedPostFolderAssignments',
    {}
  )

  function getSavedPostFolder(originalDomain: string, originalId: number) {
    return savedPostFolderAssignments.value[buildSavedPostFolderKey(originalDomain, originalId)] ?? null
  }

  function setSavedPostFolder(originalDomain: string, originalId: number, folderName: string) {
    const normalizedFolderName = normalizeSavedPostFolderName(folderName)

    if (!normalizedFolderName) {
      return false
    }

    const existingFolder =
      savedPostFolders.value.find((folder) => folder.toLowerCase() === normalizedFolderName.toLowerCase()) ?? null

    if (!existingFolder) {
      return false
    }

    savedPostFolderAssignments.value = {
      ...savedPostFolderAssignments.value,
      [buildSavedPostFolderKey(originalDomain, originalId)]: existingFolder
    }

    return true
  }

  function removeSavedPostFolder(originalDomain: string, originalId: number) {
    const key = buildSavedPostFolderKey(originalDomain, originalId)

    if (!(key in savedPostFolderAssignments.value)) {
      return
    }

    const nextAssignments = { ...savedPostFolderAssignments.value }

    delete nextAssignments[key]

    savedPostFolderAssignments.value = nextAssignments
  }

  function createSavedPostFolder(folderName: string) {
    const normalizedFolderName = normalizeSavedPostFolderName(folderName)

    if (!normalizedFolderName) {
      return false
    }

    if (savedPostFolders.value.some((folder) => folder.toLowerCase() === normalizedFolderName.toLowerCase())) {
      return false
    }

    savedPostFolders.value = savedPostFolders.value.concat(normalizedFolderName)

    return true
  }

  function deleteSavedPostFolder(folderName: string) {
    const normalizedFolderName = normalizeSavedPostFolderName(folderName)

    const existingFolder =
      savedPostFolders.value.find((folder) => folder.toLowerCase() === normalizedFolderName.toLowerCase()) ?? null

    if (!existingFolder) {
      return
    }

    savedPostFolders.value = savedPostFolders.value.filter((folder) => folder !== existingFolder)

    const nextAssignments = { ...savedPostFolderAssignments.value }

    Object.entries(nextAssignments).forEach(([key, folder]) => {
      if (folder === existingFolder) {
        delete nextAssignments[key]
      }
    })

    savedPostFolderAssignments.value = nextAssignments
  }

  function pruneSavedPostFolderAssignments() {
    const savedPostKeys = new Set(
      savedPostList.value.map((savedPost) => buildSavedPostFolderKey(savedPost.original_domain, savedPost.original_id))
    )

    const nextAssignments = { ...savedPostFolderAssignments.value }

    Object.keys(nextAssignments).forEach((key) => {
      if (!savedPostKeys.has(key)) {
        delete nextAssignments[key]
      }
    })

    savedPostFolderAssignments.value = nextAssignments
  }

  if ($pocketBase.authStore.isValid) {
    //

    email.value = $pocketBase.authStore.model.email
    license.value = $pocketBase.authStore.model.username
    subscription_expires_at.value = $pocketBase.authStore.model.subscription_expires_at

    if (import.meta.client) {
      //

      callOnce('pocketbase-initial-data', async () => {
        //

        savedPostList.value = await $pocketBase.collection('posts').getFullList<ISimplePocketbasePost>({
          fields: 'id, original_id, original_domain',

          requestKey: 'savedPostList'
        })

        pruneSavedPostFolderAssignments()
      })
    }
  }

  return {
    email,
    license,
    subscription_expires_at,

    savedPostList,
    savedPostFolders,
    savedPostFolderAssignments,

    getSavedPostFolder,
    setSavedPostFolder,
    removeSavedPostFolder,

    createSavedPostFolder,
    deleteSavedPostFolder
  }
}
