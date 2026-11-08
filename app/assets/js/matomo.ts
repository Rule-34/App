export const MATOMO_URL = 'https://matomo.akbal.dev/'
export const MATOMO_SCRIPT_URL = `${MATOMO_URL}matomo.js`
export const PREMIUM_LANDING_EXPERIMENT_NAME = 'PremiumLandingV2'
export const PREMIUM_LANDING_VARIATIONS = ['original', 'OfferFirst', 'VisualFirst'] as const
export const MATOMO_AB_STORAGE_KEY = 'MatomoAbTesting'

export type PremiumLandingVariation = (typeof PREMIUM_LANDING_VARIATIONS)[number]

export type PremiumLandingTarget = {
  path: string
  search: string
}

const ASSIGNMENT_TIMEOUT_MS = 4000
const LEGACY_AB_STORAGE_KEY = 'PiwikAbTesting'

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
let currentNavigationId = 0
let lastPageTrack: PageTrack | null = null
const experimentRecords = new Map<string, Promise<PremiumLandingVariation>>()

function pathnameOf(path: string) {
  return path.split('#')[0]?.split('?')[0] ?? path
}

/** The premium landing only. Experiment assignment does not run on account pages. */
export function isPremiumLandingPath(path: string) {
  return /\/premium\/?$/.test(pathnameOf(path))
}

/** Any `/premium` route, including locale prefixes and nested account pages. */
export function isPremiumRoute(path: string) {
  return /(?:^|\/)premium(?:\/|$)/.test(pathnameOf(path))
}

/** A late assignment still applies while the visitor is on the same path. Query changes must not freeze the arm. */
export function premiumLandingAssignmentStillApplies(
  current: { pathname: string; search: string },
  target: { path: string; search: string }
) {
  return current.pathname === target.path
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
 * A hash, if present, is not part of the query.
 */
export function premiumLandingVariationFromSearch(search: string): PremiumLandingVariation | null {
  const withoutHash = search.split('#')[0] ?? ''
  const query = withoutHash.startsWith('?') ? withoutHash.slice(1) : withoutHash
  const params = new URLSearchParams(query)
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

export function premiumLandingTargetFromPath(fullPath: string): PremiumLandingTarget {
  const withoutHash = fullPath.split('#')[0] ?? fullPath
  const queryIndex = withoutHash.indexOf('?')

  if (queryIndex === -1) {
    return { path: withoutHash, search: '' }
  }

  return {
    path: withoutHash.slice(0, queryIndex),
    search: withoutHash.slice(queryIndex)
  }
}

export function premiumLandingTargetFromRoute(to: { path: string; fullPath: string }): PremiumLandingTarget {
  const fromFullPath = premiumLandingTargetFromPath(to.fullPath)

  return {
    path: to.path,
    search: fromFullPath.search
  }
}

/**
 * Matomo AbTesting persists the chosen variation in localStorage under `MatomoAbTesting`
 * as `variation:<experiment>` so a return visit can render before `matomo.js` loads.
 */
export function cachedPremiumLandingVariation(storage: Storage | null | undefined): PremiumLandingVariation | null {
  if (!storage) {
    return null
  }

  try {
    const raw = storage.getItem(MATOMO_AB_STORAGE_KEY) || storage.getItem(LEGACY_AB_STORAGE_KEY)

    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as Record<string, { value?: string; expire?: number } | string>
    const entry = parsed[`variation:${PREMIUM_LANDING_EXPERIMENT_NAME}`]

    if (!entry) {
      return null
    }

    if (typeof entry === 'string') {
      return canonicalPremiumLandingVariation(entry)
    }

    if (typeof entry.expire === 'number' && Date.now() >= entry.expire) {
      return null
    }

    return canonicalPremiumLandingVariation(entry.value)
  } catch {
    return null
  }
}

export function synchronousPremiumLandingVariation(
  target: PremiumLandingTarget,
  storage?: Storage | null
): PremiumLandingVariation | null {
  return premiumLandingVariationFromSearch(target.search) ?? cachedPremiumLandingVariation(storage)
}

export function premiumLandingExperimentOptions(
  onActivate: (variation: PremiumLandingVariation) => void,
  target?: PremiumLandingTarget
): MatomoExperimentOptions {
  return {
    name: PREMIUM_LANDING_EXPERIMENT_NAME,
    percentage: 100,
    includedTargets: [{ attribute: 'url', inverted: '0', type: 'any', value: '' }],
    excludedTargets: [],
    trigger: () => isPremiumLandingPath(target?.path ?? location.pathname),
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

function readStorage() {
  try {
    return localStorage
  } catch {
    return null
  }
}

function capturedSearch() {
  const recorded = (window as Window & { __premiumLandingSearch?: string }).__premiumLandingSearch

  if (typeof recorded === 'string' && recorded.includes('pk_ab_test=')) {
    return recorded.split('#')[0] ?? recorded
  }

  return location.search
}

function restoreCapturedSearch() {
  const search = capturedSearch()

  if (!search.includes('pk_ab_test=') || location.search.includes('pk_ab_test=')) {
    return
  }

  history.replaceState(history.state, '', `${location.pathname}${search}${location.hash}`)
}
function withLiveSearch(target: PremiumLandingTarget): PremiumLandingTarget {
  const search = target.search.split('#')[0] ?? ''

  // The live search belongs to whatever page is currently shown. During client
  // navigation that is still the source URL, so it must not be copied onto the destination.
  if (search || location.pathname !== target.path) {
    return { path: target.path, search }
  }

  return {
    path: target.path,
    search: capturedSearch().split('#')[0] ?? ''
  }
}

function targetFromLocation(): PremiumLandingTarget {
  return {
    path: location.pathname,
    search: location.search
  }
}

function assignmentKey(target: PremiumLandingTarget) {
  return `${target.path}${target.search.split('#')[0] ?? ''}`
}

function locationMatches(target: PremiumLandingTarget) {
  return location.pathname === target.path && location.search === (target.search.split('#')[0] ?? '')
}

function whenLocationMatches(target: PremiumLandingTarget) {
  if (locationMatches(target)) {
    return Promise.resolve()
  }

  return new Promise<void>((resolve) => {
    const started = Date.now()
    const timer = setInterval(() => {
      if (locationMatches(target) || Date.now() - started > 2000) {
        clearInterval(timer)
        resolve()
      }
    }, 16)
  })
}

export function trackPremiumPlanClick(intervalKey: string) {
  matomoQueue().push(['trackEvent', 'Premium', 'Plan Click', intervalKey])
}

export function trackPremiumSubscribed(platform: string | undefined) {
  matomoQueue().push(['trackEvent', 'Premium', 'Subscribed', platform])
}

export function noteMatomoNavigation(navigationId: number) {
  currentNavigationId = navigationId
}

export function configureMatomo(options: { enabled: boolean }) {
  matomoEnabled = options.enabled
}

/**
 * Resolves when `matomo.js` has loaded or failed. AbTesting can initialize later;
 * tracker readiness does not wait for `Matomo.AbTesting.Experiment`.
 */
export function ensureMatomoLoaded() {
  if (!runsInBrowser() || !matomoEnabled) {
    return Promise.resolve()
  }

  matomoRequested = true

  if (matomoWindow().Matomo) {
    return Promise.resolve()
  }

  if (matomoLoad) {
    return matomoLoad
  }

  let settle = () => {}
  const promise = new Promise<void>((resolve) => {
    settle = resolve
  })
  matomoLoad = promise

  const finish = () => {
    settle()
  }

  const queue = matomoQueue()
  queue.push(['setTrackerUrl', `${MATOMO_URL}matomo.php`])
  queue.push(['setSiteId', '1'])
  queue.push(['setDomains', ['*.r34.app']])
  queue.push(['enableCrossDomainLinking'])
  queue.push(['setExcludedQueryParams', ['page', 'cursor']])
  queue.push(['enableLinkTracking'])

  const previousInit = matomoWindow().matomoAbTestingAsyncInit
  matomoWindow().matomoAbTestingAsyncInit = () => {
    previousInit?.()
  }

  const script = document.createElement('script')
  script.src = MATOMO_SCRIPT_URL
  script.async = true
  script.fetchPriority = 'low'
  script.onload = () => {
    finish()
  }
  script.onerror = () => {
    if (matomoLoad === promise) {
      matomoLoad = null
    }

    finish()
  }
  document.head.appendChild(script)

  return promise
}

async function assignWithMatomo(target: PremiumLandingTarget): Promise<PremiumLandingVariation> {
  const queried = premiumLandingVariationFromSearch(target.search)
  const cached = cachedPremiumLandingVariation(readStorage())

  if (location.pathname === target.path) {
    restoreCapturedSearch()
  }

  // `pk_ab_test` is read by Matomo from window.location. During client navigation that
  // location is still the source URL, so wait until it matches the destination.
  if (queried && !locationMatches(target)) {
    await whenLocationMatches(target)

    if (!locationMatches(target)) {
      return queried
    }
  }

  const loaded = await Promise.race([
    ensureMatomoLoaded().then(() => true),
    new Promise<boolean>((resolve) => {
      setTimeout(() => resolve(false), ASSIGNMENT_TIMEOUT_MS)
    })
  ])
  const Experiment = loaded ? matomoWindow().Matomo?.AbTesting?.Experiment : undefined

  if (!Experiment) {
    return queried ?? cached ?? 'original'
  }

  let activated: PremiumLandingVariation | null = null

  try {
    matomoQueue().push(['setCustomUrl', `${target.path}${target.search.split('#')[0] ?? ''}`])

    const experiment = new Experiment(
      premiumLandingExperimentOptions((variation) => {
        activated = variation
      }, target)
    )

    return (
      activated ??
      canonicalPremiumLandingVariation(experiment.getActivatedVariationName()) ??
      queried ??
      cached ??
      'original'
    )
  } catch {
    return queried ?? cached ?? 'original'
  }
}

/**
 * Resolves the landing variation for `target`, not `window.location`.
 * `pk_ab_test` and a cached `MatomoAbTesting` value resolve with no network wait.
 * Otherwise this waits for Matomo, then gives up at the assignment timeout.
 */
export function activatePremiumLandingExperiment(target?: PremiumLandingTarget): Promise<PremiumLandingVariation> {
  if (!runsInBrowser()) {
    return Promise.resolve('original')
  }

  const resolved = withLiveSearch(target ?? targetFromLocation())
  const key = assignmentKey(resolved)
  const sync = synchronousPremiumLandingVariation(resolved, readStorage())

  if (!matomoEnabled) {
    return Promise.resolve(sync ?? 'original')
  }

  let record = experimentRecords.get(key)

  if (!record) {
    record = assignWithMatomo(resolved)
    experimentRecords.set(key, record)
  }

  if (sync) {
    return Promise.resolve(sync)
  }

  return record
}

export function premiumLandingExperimentSettled(target?: PremiumLandingTarget) {
  if (!runsInBrowser() || !matomoEnabled) {
    return Promise.resolve()
  }

  const resolved = withLiveSearch(target ?? targetFromLocation())

  return (experimentRecords.get(assignmentKey(resolved)) ?? activatePremiumLandingExperiment(resolved)).then(
    () => undefined
  )
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

  const target = premiumLandingTargetFromPath(fullPath)
  const premiumRoute = isPremiumRoute(target.path)

  // Non-premium pages stay interaction-gated. Every /premium route loads immediately,
  // including visitors who only scroll and never pointerdown or keydown.
  if (!premiumRoute && !matomoRequested) {
    return Promise.resolve()
  }

  const promise = (async () => {
    if (isPremiumLandingPath(target.path)) {
      await activatePremiumLandingExperiment(target)
      await premiumLandingExperimentSettled(target)
    } else {
      await ensureMatomoLoaded()
    }

    if (navigationId !== currentNavigationId) {
      return
    }

    const queue = matomoQueue()
    queue.push(['setCustomUrl', fullPath.split('#')[0] ?? fullPath])
    queue.push(['setDocumentTitle', document.title])
    queue.push(['trackPageView'])
  })()

  lastPageTrack = { navigationId, path: fullPath, promise }

  return promise
}
