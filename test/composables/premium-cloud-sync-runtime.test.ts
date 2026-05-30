import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

function readAppFile(path: string) {
  return readFileSync(new URL(`../../app/${path}`, import.meta.url), 'utf8')
}

function functionBody(source: string, name: string) {
  const start = source.search(new RegExp(`(?:async )?function ${name}\\b`))

  expect(start).toBeGreaterThanOrEqual(0)

  const nextFunction = source.slice(start + 1).search(/\n {2}(?:async )?function /)

  return source.slice(start, nextFunction === -1 ? undefined : start + 1 + nextFunction)
}

describe('premium cloud sync runtime', () => {
  it('does not call setup-only i18n composables from the client startup plugin path', () => {
    const startupSources = [
      readAppFile('composables/usePremiumCloudSync.ts'),
      readAppFile('composables/useTagCollections.ts')
    ]

    for (const source of startupSources) {
      expect(source).not.toContain('useI18n(')
    }
  })

  it('catches initialization failures before write helpers return', () => {
    const source = readAppFile('composables/usePremiumCloudSync.ts')
    const writeHelpers = [
      'setTagCollections',
      'resetTagCollectionsCloud',
      'setUserBooruList',
      'resetUserBooruListCloud',
      'setCustomBlockList'
    ]

    for (const helper of writeHelpers) {
      const body = functionBody(source, helper)
      const failureHandler = body.indexOf('withCloudSyncFailureToast')

      expect(failureHandler).toBeGreaterThanOrEqual(0)
      expect(body.indexOf('canWriteToCloud()')).toBeGreaterThan(failureHandler)
    }

    expect(functionBody(source, 'withCloudSyncFailureToast')).toContain('} catch (error) {')
  })

  it('updates reorderable local lists before awaiting cloud persistence', () => {
    const source = readAppFile('composables/usePremiumCloudSync.ts')
    const setters = [
      {
        name: 'setTagCollections',
        localWrite: 'tagCollections.value = nextTagCollections',
        cloudWrite: 'await repository.value.saveTagCollections(nextTagCollections)'
      },
      {
        name: 'setUserBooruList',
        localWrite: 'userBooruList.value = nextBoorus',
        cloudWrite: 'await repository.value.saveBoorus(nextBoorus)'
      }
    ]

    for (const setter of setters) {
      const body = functionBody(source, setter.name)
      const firstAwait = body.indexOf('await ')
      const localWrite = body.indexOf(setter.localWrite)

      expect(localWrite).toBeGreaterThanOrEqual(0)
      expect(localWrite).toBeLessThan(firstAwait)
      expect(localWrite).toBeLessThan(body.indexOf(setter.cloudWrite))
    }
  })

  it('keeps fire-and-forget startup initialization in the client plugin only', () => {
    const pluginSource = readAppFile('plugins/050.premium-cloud-sync.client.ts')
    const pagePaths = ['pages/premium/tag-collections.vue', 'pages/premium/additional-boorus.vue', 'pages/settings.vue']

    expect(pluginSource).not.toContain('void initialize()')
    expect(pluginSource).toContain('void initializeInBackground()')

    for (const path of pagePaths) {
      const source = readAppFile(path)

      expect(source).not.toContain('void initialize()')
      expect(source).not.toContain('initializeInBackground')
    }

    expect(functionBody(readAppFile('composables/usePremiumCloudSync.ts'), 'initializeInBackground')).toContain(
      '} catch (error) {'
    )
  })

  it('subscribes after initialization even when the first cloud snapshot is empty', () => {
    const source = readAppFile('composables/usePremiumCloudSync.ts')
    const initializeSyncBody = functionBody(source, 'initializeSync')

    expect(source).not.toContain('shouldSubscribe')
    expect(initializeSyncBody).toContain('await tryEnsureRealtimeSubscription()')
  })

  it('does not fail cloud writes when realtime subscription setup fails', () => {
    const source = readAppFile('composables/usePremiumCloudSync.ts')
    const subscriptionBody = functionBody(source, 'tryEnsureRealtimeSubscription')

    expect(subscriptionBody).toContain('} catch (error) {')

    for (const helper of ['setTagCollections', 'setUserBooruList', 'setCustomBlockList']) {
      const body = functionBody(source, helper)

      expect(body).toContain('await tryEnsureRealtimeSubscription()')
      expect(body).not.toContain('await ensureRealtimeSubscription()')
    }
  })

  it('coalesces realtime cloud refresh bursts', () => {
    const source = readAppFile('composables/usePremiumCloudSync.ts')
    const queueBody = functionBody(source, 'queueRefreshFromCloud')
    const subscriptionBody = functionBody(source, 'ensureRealtimeSubscription')
    const savedPostsRealtimeBody = functionBody(source, 'handleSavedPostsRealtimeChange')

    expect(subscriptionBody).toContain('savedPosts: handleSavedPostsRealtimeChange')
    expect(subscriptionBody).toContain(
      "tagCollections: () => queueRefreshFromCloud('tagCollections', refreshTagCollectionsFromCloud)"
    )
    expect(subscriptionBody).toContain("boorus: () => queueRefreshFromCloud('boorus', refreshBoorusFromCloud)")
    expect(subscriptionBody).toContain("blockList: () => queueRefreshFromCloud('blockList', refreshBlockListFromCloud)")
    expect(subscriptionBody).not.toContain('subscribeToPremiumCloudChanges(queueRefreshFromCloud)')
    expect(queueBody).toContain('setTimeout')
    expect(queueBody).toContain('return')
    expect(savedPostsRealtimeBody).not.toContain('refreshFromCloud')
    expect(savedPostsRealtimeBody).not.toContain('refreshSavedPostsFromCloud')
    expect(savedPostsRealtimeBody).not.toContain('loadPremiumCloudState')
  })

  it('clears queued realtime refreshes when auth-bound sync state is cleared', () => {
    const source = readAppFile('composables/usePremiumCloudSync.ts')
    const clearBody = functionBody(source, 'clearAuthBoundRuntimeState')

    expect(clearBody).toContain('clearQueuedCloudRefreshes()')
  })

  it('clears all synced local state when the authenticated user changes', () => {
    const source = readAppFile('composables/usePremiumCloudSync.ts')
    const authCleanupBody = functionBody(source, 'setupAuthChangeCleanup')
    const clearSyncedLocalStateBody = functionBody(source, 'clearSyncedLocalState')

    expect(authCleanupBody).toContain('clearSyncedLocalState(lastAuthenticatedUserId)')
    expect(clearSyncedLocalStateBody).toContain('clearAuthBoundRuntimeState(userId)')
    expect(clearSyncedLocalStateBody).toContain('resetTagCollections()')
    expect(clearSyncedLocalStateBody).toContain('resetUserBooruList()')
    expect(clearSyncedLocalStateBody).toContain("selectedList.value = 'none'")
    expect(clearSyncedLocalStateBody).toContain('customBlockList.value = []')
  })

  it('does not reset the saved-posts viewer when saved post state changes', () => {
    const source = readAppFile('pages/premium/saved-posts/[domain].vue')
    const queryStart = source.indexOf('useInfiniteQuery({')
    const queryEnd = source.indexOf('queryFn: fetchPosts', queryStart)
    const preQuerySource = source.slice(0, queryStart)
    const queryKeySource = source.slice(queryStart, queryEnd)

    expect(queryStart).toBeGreaterThanOrEqual(0)
    expect(queryEnd).toBeGreaterThan(queryStart)
    expect(preQuerySource).not.toContain('watch(savedPostsRevision')
    expect(queryKeySource).not.toContain('savedPostsRevision')
  })

  it('clears inactive saved-posts query cache after new saves without pruning deletes', () => {
    const source = readAppFile('composables/usePremiumCloudSync.ts')
    const savePostBody = functionBody(source, 'savePost')
    const deleteSavedPostBody = functionBody(source, 'deleteSavedPost')
    const savedPostsRealtimeBody = functionBody(source, 'handleSavedPostsRealtimeChange')
    const clearBody = functionBody(source, 'clearInactiveSavedPostsQueries')

    expect(source).toContain('useQueryClient()')
    expect(savePostBody).toContain('upsertSavedPost(savedPost)')
    expect(savePostBody).toContain('clearInactiveSavedPostsQueries()')
    expect(savedPostsRealtimeBody).toContain('clearInactiveSavedPostsQueries()')
    expect(clearBody).toContain('queryClient.removeQueries')
    expect(clearBody).toContain("queryKey: ['saved-posts']")
    expect(clearBody).toContain("type: 'inactive'")
    expect(deleteSavedPostBody).not.toContain('clearInactiveSavedPostsQueries')
    expect(deleteSavedPostBody).not.toContain('refetchQueries')
    expect(deleteSavedPostBody).not.toContain('invalidateQueries')
    expect(deleteSavedPostBody).not.toContain('removeQueries')
  })

})
