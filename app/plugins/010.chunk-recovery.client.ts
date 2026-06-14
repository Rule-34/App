import {
  buildChunkRecoveryStorageKey,
  getRecoverableChunkLoadMessage,
  markChunkRecoveryAttempted,
  shouldAttemptChunkRecovery
} from '~/assets/js/chunk-error-recovery'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:chunkError', (error) => {
    if (!getRecoverableChunkLoadMessage(error)) {
      return
    }

    const key = buildChunkRecoveryStorageKey(window.location.href)

    try {
      if (shouldAttemptChunkRecovery({ storage: sessionStorage, key, online: navigator.onLine !== false })) {
        markChunkRecoveryAttempted({ storage: sessionStorage, key })
        window.location.reload()
        return
      }
    } catch {
      window.location.reload()
      return
    }

    showError(
      createError({
        statusCode: 503,
        statusMessage: 'App update required',
        message: 'The app could not load the latest files. Refresh the page to try again.',
        fatal: true
      })
    )
  })
})
