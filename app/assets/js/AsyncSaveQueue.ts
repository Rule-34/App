export function moveArrayItem<T>(items: readonly T[], from: number, to: number): T[] {
  const next = [...items]

  if (from < 0 || from >= next.length || to < 0 || to >= next.length) {
    return next
  }

  const item = next.splice(from, 1)[0] as T
  next.splice(to, 0, item)

  return next
}

export function createLatestAsyncQueue<T>(save: (payload: T) => Promise<void>) {
  let active: Promise<void> | null = null
  let latestPayload: T | undefined
  let hasLatestPayload = false

  async function flush() {
    while (hasLatestPayload) {
      const payload = latestPayload as T
      latestPayload = undefined
      hasLatestPayload = false

      await save(payload)
    }
  }

  return (payload: T) => {
    latestPayload = payload
    hasLatestPayload = true
    active ??= flush().finally(() => {
      active = null
    })

    return active
  }
}
