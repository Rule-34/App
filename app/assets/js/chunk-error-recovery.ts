import type * as Sentry from '@sentry/nuxt'

const chunkLoadMessagePatterns = [
  /Importing a module script failed/i,
  /Failed to fetch dynamically imported module/i,
  /error loading dynamically imported module/i,
  /Loading chunk \S+ failed/i,
  /Loading CSS chunk \S+ failed/i,
  /ChunkLoadError/i
]

export const chunkRecoveryStorageKeyPrefix = 'r34:chunk-recovery'
export const chunkRecoveryAttemptMaxAgeMs = 5 * 60 * 1000

export function getRecoverableChunkLoadMessage(error: unknown): string | null {
  const message = getErrorMessage(error)

  if (!message) {
    return null
  }

  return chunkLoadMessagePatterns.some((pattern) => pattern.test(message)) ? message : null
}

export function getRecoverableChunkLoadMessageFromSentryEvent(event: Sentry.Event): string | null {
  const exceptionValue = event.exception?.values?.find((value) => value.value)?.value
  const message = exceptionValue ?? event.message

  return getRecoverableChunkLoadMessage(message)
}

export function buildChunkRecoveryStorageKey(url: string): string {
  return `${chunkRecoveryStorageKeyPrefix}:${url}`
}

export function shouldAttemptChunkRecovery(params: {
  storage: Pick<Storage, 'getItem'>
  key: string
  online: boolean
  now?: number
}): boolean {
  const { storage, key, online, now = Date.now() } = params

  if (!online) {
    return false
  }

  const storedRecoveryAttemptedAt = storage.getItem(key)

  if (storedRecoveryAttemptedAt == null) {
    return true
  }

  const recoveryAttemptedAt = Number(storedRecoveryAttemptedAt)

  return !Number.isFinite(recoveryAttemptedAt) || now - recoveryAttemptedAt > chunkRecoveryAttemptMaxAgeMs
}

export function markChunkRecoveryAttempted(params: { storage: Pick<Storage, 'setItem'>; key: string; now?: number }) {
  params.storage.setItem(params.key, String(params.now ?? Date.now()))
}

export function hasRecentChunkRecoveryAttemptForCurrentUrl(now = Date.now()): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    return !shouldAttemptChunkRecovery({
      storage: sessionStorage,
      key: buildChunkRecoveryStorageKey(window.location.href),
      online: true,
      now
    })
  } catch {
    return false
  }
}

function getErrorMessage(error: unknown): string | null {
  if (typeof error === 'string') {
    return error
  }

  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'object' && error != null && 'message' in error) {
    const message = (error as { message?: unknown }).message

    return typeof message === 'string' ? message : null
  }

  return null
}
