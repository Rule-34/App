import type * as Sentry from '@sentry/nuxt'

const chunkLoadMessagePatterns = [
  /Importing a module script failed/i,
  /Failed to fetch dynamically imported module/i,
  /error loading dynamically imported module/i,
  /Loading chunk \S+ failed/i,
  /Loading CSS chunk \S+ failed/i,
  /ChunkLoadError/i
]

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
