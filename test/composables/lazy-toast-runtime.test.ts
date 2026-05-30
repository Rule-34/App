import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

function readAppFile(path: string) {
  return readFileSync(new URL(`../../app/${path}`, import.meta.url), 'utf8')
}

function functionBody(source: string, name: string) {
  const start = source.search(new RegExp(`(?:async )?${name}\\(`))

  expect(start).toBeGreaterThanOrEqual(0)

  const nextFunction = source.slice(start + 1).search(/\n {4}(?:async )?\w+\(/)

  return source.slice(start, nextFunction === -1 ? undefined : start + 1 + nextFunction)
}

describe('lazy toast runtime', () => {
  it('resets lazy toaster render state when the toaster unmounts', () => {
    const source = readAppFile('composables/useLazyToast.ts')
    const unmountBody = functionBody(source, 'markToasterUnmounted')

    expect(unmountBody).toContain('isToasterReady.value = false')
    expect(unmountBody).toContain('shouldRenderToaster.value = false')
  })
})
