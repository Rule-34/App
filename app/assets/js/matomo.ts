export const MATOMO_URL = 'https://matomo.akbal.dev/'
export const MATOMO_SCRIPT_URL = `${MATOMO_URL}matomo.js`
export const PREMIUM_LANDING_EXPERIMENT_NAME = 'PremiumLandingV2'
export const PREMIUM_LANDING_VARIATIONS = ['original', 'OfferFirst', 'VisualFirst'] as const

export type PremiumLandingVariation = (typeof PREMIUM_LANDING_VARIATIONS)[number]

const ASSIGNMENT_TIMEOUT_MS = 4000

type MatomoQueue = unknown[][]

type PremiumLandingExperiment = {
  getActivatedVariationName(): string | undefined
}

type MatomoExperimentOptions = {
  name: string
  percentage: number
  includedTargets: { attribute: string; inverted: string; type: string; value: string }[]
  excludedTargets: []
  trigger: () => boolean
  variations: {
    name: PremiumLandingVariation
    activate: (this: { name: string }, event: unknown) => void
  }[]
}

type MatomoWindow = Window & {
  _paq?: MatomoQueue
  Matomo?: {
    AbTesting?: {
      Experiment: new (options: MatomoExperimentOptions) => PremiumLandingExperiment
    }
  }
  matomoAbTestingAsyncInit?: () => void
}

type PageTrack = {
  navigationId: number
  path: string
  promise: Promise<void>
}

let matomoRequested = false
let matomoEnabled = true
let matomoLoad: Promise<void> | null = null
let activationKey: string | null = null
let activationVariation: PremiumLandingVariation | null = null
let activation: Promise<PremiumLandingVariation> | null = null
let lastPageTrack: PageTrack | null = null

function pathnameOf(path: string) {
  return path.split('?')[0]?.split('#')[0] ?? path
}

/** The premium landing only. Experiment assignment does not run on account pages. */
export function isPremiumLandingPath(path: string) {
  return /\/premium\/?$/.test(pathnameOf(path))
}

/** Any `/premium` route, including locale prefixes and nested account pages. */
export function isPremiumRoute(path: string) {
  return /(?:^|\/)premium(?:\/|$)/.test(pathnameOf(path))
}

function runsInBrowser() {
  return import.meta.client || (typeof window !== 'undefined' && import.meta.server !== true)
}

export function canonicalPremiumLandingVariation(name: string | null | undefined): PremiumLandingVariation | null {
  if (!name) {
    return null
  }

  const normalized = name.trim().toLowerCase()

  return PREMIUM_LANDING_VARIATIONS.find((variation) => variation.toLowerCase() === normalized) ?? null
}

/**
 * `pk_ab_test` forces a variation and suppresses the experiment hit.
 * Matomo accepts a comma-separated list and uses the first name this experiment defines.
 */
export function premiumLandingVariationFromSearch(search: string): PremiumLandingVariation | null {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const raw = params.get('pk_ab_test')

  if (!raw) {
    return null
  }

  for (const part of raw.split(',')) {
    const variation = canonicalPremiumLandingVariation(part)

    if (variation) {
      return variation
    }
  }

  return null
}

export function premiumLandingExperimentOptions(
  onActivate: (variation: PremiumLandingVariation) => void
): MatomoExperimentOptions {
  return {
    name: PREMIUM_LANDING_EXPERIMENT_NAME,
    percentage: 100,
    includedTargets: [{ attribute: 'url', inverted: '0', type: 'any', value: '' }],
    excludedTargets: [],
    trigger: () => isPremiumLandingPath(location.pathname),
    variations: PREMIUM_LANDING_VARIATIONS.map((name) => ({
      name,
      activate(this: { name: string }) {
        const variation = canonicalPremiumLandingVariation(this.name)

        if (variation) {
          onActivate(variation)
        }
      }
    }))
  }
}

function matomoWindow() {
  return window as MatomoWindow
}

function matomoQueue() {
  const target = matomoWindow()
  target._paq = target._paq || []

  return target._paq
}

export function configureMatomo(options: { enabled: boolean }) {
  matomoEnabled = options.enabled
}

export function ensureMatomoLoaded() {
  if (!runsInBrowser() || !matomoEnabled) {
    return Promise.resolve()
  }

  matomoRequested = true

  if (matomoWindow().Matomo?.AbTesting?.Experiment) {
    return Promise.resolve()
  }

  if (matomoLoad) {
    return matomoLoad
  }

  matomoLoad = new Promise((resolve) => {
    let settled = false

    const finish = () => {
      if (settled) {
        return
      }

      settled = true
      resolve()
    }

    const queue = matomoQueue()
    queue.push(['setTrackerUrl', `${MATOMO_URL}matomo.php`])
    queue.push(['setSiteId', '1'])
    queue.push(['setDomains', ['*.r34.app']])
    queue.push(['enableCrossDomainLinking'])
    queue.push(['setExcludedQueryParams', ['page', 'cursor']])
    queue.push(['enableLinkTracking'])

    const previousInit = matomoWindow().matomoAbTestingAsyncInit

    // Matomo calls this once AbTesting is on `Matomo`, before the tracker is idle.
    matomoWindow().matomoAbTestingAsyncInit = () => {
      previousInit?.()
      finish()
    }

    const script = document.createElement('script')
    script.src = MATOMO_SCRIPT_URL
    script.async = true
    script.onload = () => {
      if (matomoWindow().Matomo?.AbTesting?.Experiment) {
        finish()
      }
    }
    script.onerror = finish
    document.head.appendChild(script)
  })

  return matomoLoad
}

function assignmentKey() {
  return `${location.pathname}${location.search}`
}

async function assignPremiumLandingVariation(key: string): Promise<PremiumLandingVariation> {
  const queried = premiumLandingVariationFromSearch(location.search)
  const loaded = await Promise.race([
    ensureMatomoLoaded().then(() => true),
    new Promise<boolean>((resolve) => {
      setTimeout(() => resolve(false), ASSIGNMENT_TIMEOUT_MS)
    })
  ])
  const Experiment = loaded ? matomoWindow().Matomo?.AbTesting?.Experiment : undefined

  if (!Experiment) {
    return queried ?? 'original'
  }

  let activated: PremiumLandingVariation | null = null

  try {
    const experiment = new Experiment(
      premiumLandingExperimentOptions((variation) => {
        activated = variation
      })
    )
    const selected =
      activated ?? canonicalPremiumLandingVariation(experiment.getActivatedVariationName()) ?? queried ?? 'original'

    return selected
  } catch {
    return queried ?? 'original'
  } finally {
    activationKey = key
  }
}

/**
 * Creates the Matomo experiment once per URL and returns the variation to render.
 * A forced `pk_ab_test` still goes through `Experiment`, which skips the tracking hit.
 */
export function activatePremiumLandingExperiment(): Promise<PremiumLandingVariation> {
  if (!runsInBrowser()) {
    return Promise.resolve('original')
  }

  if (!matomoEnabled) {
    return Promise.resolve(premiumLandingVariationFromSearch(location.search) ?? 'original')
  }

  const key = assignmentKey()

  if (activationKey === key && activationVariation) {
    return Promise.resolve(activationVariation)
  }

  if (activation) {
    return activation
  }

  activation = assignPremiumLandingVariation(key).then((variation) => {
    activationKey = key
    activationVariation = variation
    activation = null

    return variation
  })

  return activation
}

export function trackMatomoPageView(fullPath: string, navigationId: number, options?: { load?: boolean }) {
  if (!runsInBrowser()) {
    return Promise.resolve()
  }

  if (options?.load) {
    matomoRequested = true
  }

  if (lastPageTrack?.navigationId === navigationId && lastPageTrack.path === fullPath) {
    return lastPageTrack.promise
  }

  const premiumRoute = isPremiumRoute(fullPath)

  // Non-premium pages stay interaction-gated. Every /premium route loads immediately,
  // including visitors who only scroll and never pointerdown or keydown.
  if (!premiumRoute && !matomoRequested) {
    return Promise.resolve()
  }

  const promise = (async () => {
    if (isPremiumLandingPath(fullPath)) {
      await activatePremiumLandingExperiment()
    } else {
      await ensureMatomoLoaded()
    }

    const queue = matomoQueue()
    queue.push(['setCustomUrl', fullPath])
    queue.push(['setDocumentTitle', document.title])
    queue.push(['trackPageView'])
  })()

  lastPageTrack = { navigationId, path: fullPath, promise }

  return promise
}
