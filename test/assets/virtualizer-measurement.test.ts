import { describe, expect, it } from 'vitest'
import { measureVirtualItemsAfterVueUpdate } from '../../app/assets/js/virtualizer-measurement'

describe('virtualizer measurement', () => {
  it('cleans stale cached elements before measuring connected virtual rows', () => {
    const measured: Array<Element | null> = []
    const connected = { isConnected: true } as Element
    const disconnected = { isConnected: false } as Element

    measureVirtualItemsAfterVueUpdate({
      elements: [connected, null, disconnected],
      virtualizer: {
        measureElement(element) {
          measured.push(element)
        }
      }
    })

    expect(measured).toEqual([null, connected])
  })
})
