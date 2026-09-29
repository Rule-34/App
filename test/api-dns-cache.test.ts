import { afterEach, describe, expect, it, vi } from 'vitest'
import { getGlobalDispatcher, setGlobalDispatcher } from 'undici'

const originalDispatcher = getGlobalDispatcher()

describe('API DNS cache plugin', () => {
  afterEach(() => {
    setGlobalDispatcher(originalDispatcher)
    vi.unstubAllGlobals()
  })

  it('installs a bounded dispatcher and closes it with Nitro', async () => {
    vi.stubGlobal('defineNitroPlugin', <T>(plugin: T) => plugin)
    const plugin = (await import('../server/plugins/api-dns-cache')).default
    let closeHook: (() => Promise<void>) | undefined

    plugin({
      hooks: {
        hook(name: string, callback: () => Promise<void>) {
          expect(name).toBe('close')
          closeHook = callback
        }
      }
    } as never)

    const dispatcher = getGlobalDispatcher()

    expect(dispatcher).not.toBe(originalDispatcher)
    expect(closeHook).toBeTypeOf('function')

    await closeHook?.()
  })
})
