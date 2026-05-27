import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

function readAppFile(path: string) {
  return readFileSync(new URL(`../../app/${path}`, import.meta.url), 'utf8')
}

function functionBody(source: string, name: string) {
  const start = source.indexOf(`async function ${name}`)

  expect(start).toBeGreaterThanOrEqual(0)

  const nextFunction = source.indexOf('\n  async function ', start + 1)

  return source.slice(start, nextFunction === -1 ? undefined : nextFunction)
}

describe('premium cloud sync runtime', () => {
  it('does not call setup-only i18n composables from the client startup plugin path', () => {
    const startupSources = [
      readAppFile('composables/usePremiumCloudSync.ts'),
      readAppFile('composables/useTagCollections.ts')
    ]

    for (const source of startupSources) {
      expect(source).not.toContain('useI18n(')
    }
  })

  it('catches initialization failures before write helpers return', () => {
    const source = readAppFile('composables/usePremiumCloudSync.ts')
    const writeHelpers = [
      'setTagCollections',
      'resetTagCollectionsCloud',
      'setUserBooruList',
      'resetUserBooruListCloud',
      'setCustomBlockList'
    ]

    for (const helper of writeHelpers) {
      const body = functionBody(source, helper)
      const beforeFirstTry = body.slice(0, body.indexOf('try {'))

      expect(beforeFirstTry).not.toContain('canWriteToCloud()')
    }
  })

  it('updates reorderable local lists before awaiting cloud persistence', () => {
    const source = readAppFile('composables/usePremiumCloudSync.ts')
    const setters = [
      {
        name: 'setTagCollections',
        localWrite: 'tagCollections.value = nextTagCollections',
        cloudWrite: 'await repository.value.saveTagCollections(nextTagCollections)'
      },
      {
        name: 'setUserBooruList',
        localWrite: 'userBooruList.value = nextBoorus',
        cloudWrite: 'await repository.value.saveBoorus(nextBoorus)'
      }
    ]

    for (const setter of setters) {
      const body = functionBody(source, setter.name)
      const firstAwait = body.indexOf('await ')
      const localWrite = body.indexOf(setter.localWrite)

      expect(localWrite).toBeGreaterThanOrEqual(0)
      expect(localWrite).toBeLessThan(firstAwait)
      expect(localWrite).toBeLessThan(body.indexOf(setter.cloudWrite))
    }
  })

  it('uses a non-throwing initializer for fire-and-forget startup calls', () => {
    const sourcePaths = [
      'plugins/050.premium-cloud-sync.client.ts',
      'pages/premium/tag-collections.vue',
      'pages/premium/additional-boorus.vue',
      'pages/settings.vue'
    ]

    for (const path of sourcePaths) {
      const source = readAppFile(path)

      expect(source).not.toContain('void initialize()')
      expect(source).toContain('void initializeInBackground()')
    }

    expect(functionBody(readAppFile('composables/usePremiumCloudSync.ts'), 'initializeInBackground')).toContain(
      '} catch (error) {'
    )
  })
})
