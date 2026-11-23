import { afterEach, describe, expect, it, vi } from 'vitest'

type FakeScript = {
  src: string
  async: boolean
  onload?: () => void
  onerror?: () => void
}

async function loadMatomoModule(pathname: string, search = '') {
  vi.resetModules()

  const scripts: FakeScript[] = []
  let experiments = 0
  const matomoWindow = {
    _paq: [] as unknown[][],
    Matomo: undefined as
      | {
          AbTesting: {
            Experiment: new (options: {
              name: string
              variations: { name: string; activate: (this: { name: string }) => void }[]
            }) => { getActivatedVariationName(): string | undefined }
          }
        }
      | undefined
  }

  vi.stubGlobal('window', matomoWindow)
  vi.stubGlobal('location', { pathname, search })
  vi.stubGlobal('document', {
    title: 'Premium',
    createElement: () => {
      const script: FakeScript = { src: '', async: false }
      scripts.push(script)
      return script
    },
    head: {
      appendChild(script: FakeScript) {
        matomoWindow.Matomo = {
          AbTesting: {
            Experiment: class {
              selected?: string

              constructor(options: {
                name: string
                variations: { name: string; activate: (this: { name: string }) => void }[]
              }) {
                experiments += 1
                const forced = new URLSearchParams(search).get('pk_ab_test')
                const match = options.variations.find(
                  (variation) => variation.name.toLowerCase() === forced?.toLowerCase()
                )

                if (match) {
                  match.activate.call(match)
                  this.selected = match.name
                }
              }

              getActivatedVariationName() {
                return this.selected
              }
            }
          }
        }
        script.onload?.()
      }
    }
  })

  const matomo = await import('../../app/assets/js/matomo')
  matomo.configureMatomo({ enabled: true })

  return { matomo, matomoWindow, scripts, experimentCount: () => experiments }
}

describe('Matomo on /premium routes', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('loads the tracker and can record goal 6 on a nested premium route without interaction', async () => {
    const { matomo, matomoWindow, scripts, experimentCount } = await loadMatomoModule('/premium/dashboard')

    matomo.noteMatomoNavigation(1)
    await matomo.trackMatomoPageView('/premium/dashboard', 1)

    expect(scripts.map((script) => script.src)).toEqual(['https://matomo.akbal.dev/matomo.js'])
    expect(matomoWindow._paq).toContainEqual(['trackPageView'])
    expect(experimentCount()).toBe(0)

    matomo.trackPremiumSubscribed('sellapp')

    expect(matomoWindow._paq).toContainEqual(['trackEvent', 'Premium', 'Subscribed', 'sellapp'])
  })

  it('assigns a forced landing variation and can record goal 5 before any interaction', async () => {
    const { matomo, matomoWindow, scripts } = await loadMatomoModule('/premium', '?pk_ab_test=VisualFirst')

    await expect(matomo.activatePremiumLandingExperiment()).resolves.toBe('VisualFirst')
    matomo.noteMatomoNavigation(1)
    await matomo.trackMatomoPageView('/premium?pk_ab_test=VisualFirst', 1)

    expect(scripts).toHaveLength(1)
    expect(matomoWindow._paq).toContainEqual(['setCustomUrl', '/premium?pk_ab_test=VisualFirst'])
    expect(matomoWindow._paq).toContainEqual(['trackPageView'])

    matomo.trackPremiumPlanClick('yearly')

    expect(matomoWindow._paq).toContainEqual(['trackEvent', 'Premium', 'Plan Click', 'yearly'])
  })

  it('does not load Matomo for a non-premium path before interaction', async () => {
    const { matomo, scripts } = await loadMatomoModule('/')

    matomo.noteMatomoNavigation(1)
    await matomo.trackMatomoPageView('/posts/rule34.xxx', 1)

    expect(scripts).toEqual([])
  })

  it('resolves the tracker when matomo.js loads without AbTesting', async () => {
    vi.resetModules()
    const matomoWindow = {
      _paq: [] as unknown[][],
      Matomo: undefined
    }

    vi.stubGlobal('window', matomoWindow)
    vi.stubGlobal('location', { pathname: '/premium', search: '' })
    vi.stubGlobal('document', {
      title: 'Premium',
      createElement: () => ({
        src: '',
        async: true,
        onload: undefined as (() => void) | undefined,
        onerror: undefined
      }),
      head: {
        appendChild(script: { onload?: () => void }) {
          script.onload?.()
        }
      }
    })

    const matomo = await import('../../app/assets/js/matomo')
    matomo.configureMatomo({ enabled: true })

    await expect(matomo.ensureMatomoLoaded()).resolves.toBeUndefined()
    expect(matomoWindow.Matomo).toBeUndefined()
  })

  it('retries loading after the script errors', async () => {
    vi.resetModules()
    const scripts: { onerror?: () => void; onload?: () => void }[] = []
    let attempts = 0

    vi.stubGlobal('window', { _paq: [] as unknown[][], Matomo: undefined })
    vi.stubGlobal('location', { pathname: '/premium', search: '' })
    vi.stubGlobal('document', {
      title: 'Premium',
      createElement: () => {
        const script = {
          src: '',
          async: true,
          onload: undefined as (() => void) | undefined,
          onerror: undefined as (() => void) | undefined
        }
        scripts.push(script)
        return script
      },
      head: {
        appendChild(script: { onerror?: () => void; onload?: () => void }) {
          attempts += 1

          if (attempts === 1) {
            script.onerror?.()
            return
          }

          script.onload?.()
        }
      }
    })

    const matomo = await import('../../app/assets/js/matomo')
    matomo.configureMatomo({ enabled: true })

    await matomo.ensureMatomoLoaded()
    await matomo.ensureMatomoLoaded()

    expect(scripts).toHaveLength(2)
  })

  it('gives up on a landing assignment when Matomo is delayed past the timeout', async () => {
    vi.resetModules()

    vi.stubGlobal('window', { _paq: [] as unknown[][] })
    vi.stubGlobal('location', { pathname: '/premium', search: '' })
    vi.stubGlobal('document', {
      title: 'Premium',
      createElement: () => ({ src: '', async: true }),
      head: { appendChild() {} }
    })

    const matomo = await import('../../app/assets/js/matomo')
    matomo.configureMatomo({ enabled: true })

    vi.useFakeTimers()

    try {
      const result = matomo.activatePremiumLandingExperiment({ path: '/premium', search: '' })
      await vi.advanceTimersByTimeAsync(4000)

      await expect(result).resolves.toBe('original')
    } finally {
      vi.useRealTimers()
    }
  })

  it('does not send a pageview for a navigation that already moved on', async () => {
    vi.resetModules()
    let release: (() => void) | undefined
    const matomoWindow = {
      _paq: [] as unknown[][],
      Matomo: undefined as
        { AbTesting?: { Experiment: new () => { getActivatedVariationName: () => undefined } } } | undefined
    }

    vi.stubGlobal('window', matomoWindow)
    vi.stubGlobal('location', { pathname: '/premium', search: '' })
    vi.stubGlobal('document', {
      title: 'Premium',
      createElement: () => ({ src: '', async: true, onload: undefined as (() => void) | undefined }),
      head: {
        appendChild(script: { onload?: () => void }) {
          release = () => {
            matomoWindow.Matomo = {
              AbTesting: {
                Experiment: class {
                  getActivatedVariationName() {
                    return undefined
                  }
                }
              }
            }
            script.onload?.()
          }
        }
      }
    })

    const matomo = await import('../../app/assets/js/matomo')
    matomo.configureMatomo({ enabled: true })
    matomo.noteMatomoNavigation(1)

    const tracked = matomo.trackMatomoPageView('/premium', 1)
    matomo.noteMatomoNavigation(2)
    release?.()
    await tracked

    expect(matomoWindow._paq).not.toContainEqual(['trackPageView'])
  })

  it('uses the destination route instead of window.location for pk_ab_test', async () => {
    const { matomo } = await loadMatomoModule('/other-sites', '')

    await expect(
      matomo.activatePremiumLandingExperiment({ path: '/premium', search: '?pk_ab_test=OfferFirst#pricing' })
    ).resolves.toBe('OfferFirst')
  })

  it('does not copy the source page query onto a premium destination', async () => {
    vi.resetModules()
    const queue: unknown[][] = []
    const matomoWindow = {
      _paq: queue,
      __premiumLandingSearch: '?tags=cat',
      Matomo: undefined as
        { AbTesting: { Experiment: new () => { getActivatedVariationName(): string | undefined } } } | undefined
    }

    vi.stubGlobal('window', matomoWindow)
    vi.stubGlobal('location', { pathname: '/other-sites', search: '?tags=cat', hash: '' })
    vi.stubGlobal('history', {
      state: null,
      replaceState() {
        throw new Error('should not rewrite the source url')
      }
    })
    vi.stubGlobal('document', {
      title: 'Other',
      createElement: () => ({ src: '', async: true, onload: undefined as (() => void) | undefined }),
      head: {
        appendChild(script: { onload?: () => void }) {
          matomoWindow.Matomo = {
            AbTesting: {
              Experiment: class {
                getActivatedVariationName() {
                  return 'original'
                }
              }
            }
          }
          script.onload?.()
        }
      }
    })

    const matomo = await import('../../app/assets/js/matomo')
    matomo.configureMatomo({ enabled: true })
    await matomo.activatePremiumLandingExperiment({ path: '/premium', search: '' })
    await matomo.premiumLandingExperimentSettled({ path: '/premium', search: '' })

    expect(queue.filter((item) => item[0] === 'setCustomUrl').map((item) => item[1])).not.toContain('/premium?tags=cat')
  })

  it('uses the variation Matomo activates when the URL does not force one', async () => {
    vi.resetModules()
    vi.stubGlobal('window', { _paq: [] as unknown[][] })
    vi.stubGlobal('location', { pathname: '/premium', search: '' })
    vi.stubGlobal('document', {
      title: 'Premium',
      createElement: () => ({ src: '', async: true, onload: undefined as (() => void) | undefined }),
      head: {
        appendChild(script: { onload?: () => void }) {
          const matomoWindow = window as Window & {
            Matomo?: {
              AbTesting: {
                Experiment: new (options: {
                  variations: { name: string; activate: (this: { name: string }) => void }[]
                }) => { getActivatedVariationName(): string }
              }
            }
          }
          matomoWindow.Matomo = {
            AbTesting: {
              Experiment: class {
                constructor(options: { variations: { name: string; activate: (this: { name: string }) => void }[] }) {
                  const offer = options.variations.find((variation) => variation.name === 'OfferFirst')
                  offer?.activate.call(offer!)
                }

                getActivatedVariationName() {
                  return 'OfferFirst'
                }
              }
            }
          }
          script.onload?.()
        }
      }
    })

    const matomo = await import('../../app/assets/js/matomo')
    matomo.configureMatomo({ enabled: true })

    await expect(matomo.activatePremiumLandingExperiment({ path: '/premium', search: '' })).resolves.toBe('OfferFirst')
  })
})
