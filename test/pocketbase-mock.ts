import type { Page, Route } from 'playwright-core'
import type { IPocketbasePost, ISimplePocketbasePost } from '../app/assets/js/pocketbase.dto'

export const validPocketbaseToken = [
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  'eyJleHAiOjQxMDI0NDQ4MDAsImlkIjoidGVzdC11c2VyIn0',
  'signature'
].join('.')

export const authRecord = {
  id: 'test-user',
  email: 'test@example.com',
  username: 'test-user',
  subscription_expires_at: '2099-12-31T00:00:00.000Z'
}

export async function addPocketBaseAuthCookie(page: Page, appUrl: string) {
  const cookieValue = encodeURIComponent(
    JSON.stringify({
      token: validPocketbaseToken,
      model: authRecord
    })
  )

  await page.context().addCookies([
    {
      name: 'pb_auth',
      value: cookieValue,
      url: appUrl
    }
  ])
  await page.addInitScript((value) => {
    document.cookie = `pb_auth=${value}; path=/; SameSite=Strict`
    window.localStorage.setItem(
      'pocketbase_auth',
      JSON.stringify(JSON.parse(decodeURIComponent(value)) as { token: string; model: unknown })
    )
  }, cookieValue)
}

type PocketBaseRecord = Record<string, unknown> & { id: string }

export type PocketBaseMockState = {
  requests: string[]
  savedPostSummaries: ISimplePocketbasePost[]
  savedPostRecords: IPocketbasePost[]
  tagCollectionRecords: PocketBaseRecord[]
  booruRecords: PocketBaseRecord[]
  blockListRecords: PocketBaseRecord[]
  delaySavedPostSummariesMs: number
}

export function createPocketBaseMockState(overrides: Partial<PocketBaseMockState> = {}): PocketBaseMockState {
  return {
    requests: [],
    savedPostSummaries: [],
    savedPostRecords: [],
    tagCollectionRecords: [],
    booruRecords: [],
    blockListRecords: [],
    delaySavedPostSummariesMs: 0,
    ...overrides
  }
}

export async function mockPocketBase(page: Page, state: PocketBaseMockState) {
  await page.route('https://pocketbase.r34.app/**', async (route) => {
    const request = route.request()
    const requestUrl = new URL(request.url())
    const requestKey = `${request.method()} ${requestUrl.pathname}${requestUrl.search}`

    state.requests.push(requestKey)

    if (requestUrl.pathname === '/api/collections/users/auth-with-password') {
      await fulfillJson(route, { token: validPocketbaseToken, record: authRecord })
      return
    }

    if (requestUrl.pathname === '/api/collections/users/auth-refresh') {
      await fulfillJson(route, { token: validPocketbaseToken, record: authRecord })
      return
    }

    if (requestUrl.pathname === '/api/realtime') {
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'text/event-stream' },
        body: 'event: PB_CONNECT\ndata: {"clientId":"test-client"}\n\n'
      })
      return
    }

    const collectionMatch = requestUrl.pathname.match(/^\/api\/collections\/([^/]+)\/records(?:\/([^/]+))?$/)

    if (!collectionMatch) {
      await fulfillJson(route, { message: `Unhandled PocketBase mock route: ${requestKey}` }, 404)
      return
    }

    const [, collectionName, recordId] = collectionMatch

    if (request.method() === 'GET') {
      const perPage = Number(requestUrl.searchParams.get('perPage')) || undefined
      const records = recordsForCollection(collectionName, requestUrl, state)

      if (collectionName === 'posts' && isSavedPostSummaryRequest(requestUrl) && state.delaySavedPostSummariesMs) {
        await new Promise((resolve) => setTimeout(resolve, state.delaySavedPostSummariesMs))
      }

      await fulfillJson(route, pageResponse(records, perPage))
      return
    }

    if (request.method() === 'POST' && collectionName === 'posts') {
      const payload = request.postDataJSON() as IPocketbasePost
      const record: IPocketbasePost = {
        id: `saved-post-${state.savedPostRecords.length + 1}`,
        ...payload
      }

      state.savedPostRecords.push(record)
      state.savedPostSummaries.push({
        id: record.id!,
        original_id: record.original_id,
        original_domain: record.original_domain
      })

      await fulfillJson(route, record)
      return
    }

    if (request.method() === 'DELETE' && collectionName === 'posts' && recordId) {
      state.savedPostRecords = state.savedPostRecords.filter((record) => record.id !== recordId)
      state.savedPostSummaries = state.savedPostSummaries.filter((record) => record.id !== recordId)

      await fulfillJson(route, {})
      return
    }

    await fulfillJson(route, { message: `Unhandled PocketBase mock mutation: ${requestKey}` }, 404)
  })
}

function recordsForCollection(collectionName: string, requestUrl: URL, state: PocketBaseMockState) {
  switch (collectionName) {
    case 'posts':
      return isSavedPostSummaryRequest(requestUrl) ? state.savedPostSummaries : state.savedPostRecords

    case 'tag_collections':
      return state.tagCollectionRecords

    case 'boorus':
      return state.booruRecords

    case 'tag_blocklists':
      return state.blockListRecords

    default:
      return []
  }
}

function isSavedPostSummaryRequest(requestUrl: URL) {
  return requestUrl.searchParams.get('fields')?.includes('original_id')
}

function pageResponse<T>(items: T[], requestedPerPage?: number) {
  const perPage = requestedPerPage ?? (items.length || 30)

  return {
    page: 1,
    perPage,
    totalItems: items.length,
    totalPages: items.length ? 1 : 0,
    items
  }
}

async function fulfillJson(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body)
  })
}
