import {
  buildChunkRecoveryStorageKey,
  getRecoverableChunkLoadMessage,
  markChunkRecoveryAttempted,
  shouldAttemptChunkRecovery
} from '~/assets/js/chunk-error-recovery'

type VitePreloadErrorEvent = Event & {
  payload?: unknown
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:chunkError', (error) => {
    if (!getRecoverableChunkLoadMessage(error)) {
      return
    }

    recoverFromChunkError()
  })

  window.addEventListener('vite:preloadError', (event) => {
    const preloadErrorEvent = event as VitePreloadErrorEvent

    if (!getRecoverableChunkLoadMessage(preloadErrorEvent.payload ?? preloadErrorEvent)) {
      return
    }

    preloadErrorEvent.preventDefault()
    recoverFromChunkError()
  })
})

function recoverFromChunkError() {
  const key = buildChunkRecoveryStorageKey(window.location.href)

  try {
    if (shouldAttemptChunkRecovery({ storage: sessionStorage, key, online: navigator.onLine !== false })) {
      markChunkRecoveryAttempted({ storage: sessionStorage, key })
      reloadNuxtApp({ persistState: true })
      return
    }
  } catch {
    reloadNuxtApp({ persistState: true })
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
}
