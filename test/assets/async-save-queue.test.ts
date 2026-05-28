import { describe, expect, it } from 'vitest'
import { createLatestAsyncQueue, moveArrayItem } from '../../app/assets/js/AsyncSaveQueue'

function deferred() {
  let resolve!: () => void
  const promise = new Promise<void>((done) => {
    resolve = done
  })

  return { promise, resolve }
}

describe('moveArrayItem', () => {
  it('returns a synchronously reordered copy without mutating the original list', () => {
    const original = ['animated', 'cat', 'dog']

    expect(moveArrayItem(original, 0, 2)).toEqual(['cat', 'dog', 'animated'])
    expect(original).toEqual(['animated', 'cat', 'dog'])
  })
})

describe('createLatestAsyncQueue', () => {
  it('serializes writes and collapses queued payloads to the latest value', async () => {
    const firstSave = deferred()
    const savedPayloads: string[] = []
    const queue = createLatestAsyncQueue(async (payload: string) => {
      savedPayloads.push(payload)

      if (payload === 'first') {
        await firstSave.promise
      }
    })

    const first = queue('first')
    const second = queue('second')
    const third = queue('third')

    await Promise.resolve()

    expect(savedPayloads).toEqual(['first'])

    firstSave.resolve()
    await Promise.all([first, second, third])

    expect(savedPayloads).toEqual(['first', 'third'])
  })
})
