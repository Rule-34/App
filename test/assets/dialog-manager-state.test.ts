import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resolvePendingDialog, useDialogManagerState } from '../../app/composables/useDialogManagerState'

type State<T> = { value: T }

const states = new Map<string, State<unknown>>()
const statistics = {
  timesTheAppHasBeenOpened: { value: 30 },
  promptInstallPwa: { value: false },
  promptFeedback: { value: false },
  promptNewsletter: { value: false },
  promptReview: { value: false }
}
const premium = { value: false }

beforeEach(() => {
  states.clear()
  statistics.timesTheAppHasBeenOpened.value = 30
  statistics.promptInstallPwa.value = false
  statistics.promptFeedback.value = false
  statistics.promptNewsletter.value = false
  statistics.promptReview.value = false
  premium.value = false

  vi.stubGlobal('computed', <T>(getter: () => T) => ({
    get value() {
      return getter()
    }
  }))
  vi.stubGlobal('useState', <T>(key: string, init: () => T) => {
    if (!states.has(key)) {
      states.set(key, { value: init() })
    }

    return states.get(key) as State<T>
  })
  vi.stubGlobal('useAppStatistics', () => statistics)
  vi.stubGlobal('usePremiumDialog', () => ({ open: premium }))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('resolvePendingDialog', () => {
  it('does not select another automatic dialog after one has been shown', () => {
    expect(resolvePendingDialog(false, 'feedback', true)).toBeUndefined()
  })

  it('allows premium after an automatic dialog has been shown', () => {
    expect(resolvePendingDialog(true, 'feedback', true)).toBe('premium')
  })
})

describe('useDialogManagerState', () => {
  it('does not cascade or reset automatic dialogs when recreated during one startup', () => {
    const firstManager = useDialogManagerState()

    expect(firstManager.pendingDialog.value).toBe('installPwa')
    firstManager.closeDialog()
    expect(firstManager.pendingDialog.value).toBeUndefined()

    const recreatedManager = useDialogManagerState()

    expect(recreatedManager.pendingDialog.value).toBeUndefined()
  })

  it('lets premium preempt and restore an unconsumed automatic dialog', () => {
    const manager = useDialogManagerState()

    premium.value = true
    expect(manager.pendingDialog.value).toBe('premium')

    manager.closeDialog()
    expect(manager.pendingDialog.value).toBe('installPwa')
  })

  it('lets premium open after an automatic dialog has been consumed', () => {
    const manager = useDialogManagerState()

    manager.closeDialog()
    premium.value = true
    expect(manager.pendingDialog.value).toBe('premium')

    manager.closeDialog()
    expect(manager.pendingDialog.value).toBeUndefined()
  })
})
