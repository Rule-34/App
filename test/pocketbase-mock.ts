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
  delaySavedPostMutationMs: number
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
    delaySavedPostMutationMs: 0,
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

    if (requestUrl.pathname === '/api/batch' && request.method() === 'POST') {
      const batchPayload = parseBatchPayload(request)

      if (!batchPayload) {
        await fulfillJson(route, { message: 'Unable to parse PocketBase batch payload' }, 400)
        return
      }

      for (const batchRequest of batchPayload.requests ?? []) {
        const batchRequestUrl = URL.parse(batchRequest.url, requestUrl.origin)

        if (!batchRequestUrl) {
          await fulfillJson(route, { message: `Invalid PocketBase batch URL: ${batchRequest.url}` }, 400)
          return
        }

        const batchResponse = await applyCollectionMutation(
          state,
          batchRequest.method,
          batchRequestUrl,
          batchRequest.body as Record<string, unknown> | undefined
        )

        if (batchResponse.status >= 400) {
          await fulfillJson(route, batchResponse.body, batchResponse.status)
          return
        }
      }

      await fulfillJson(route, { requests: [] })
      return
    }

    const collectionMatch = requestUrl.pathname.match(/^\/api\/collections\/([^/]+)\/records(?:\/([^/]+))?$/)

    if (!collectionMatch) {
      await fulfillJson(route, { message: `Unhandled PocketBase mock route: ${requestKey}` }, 404)
      return
    }

    const [, collectionName] = collectionMatch

    if (request.method() === 'GET') {
      const perPage = Number(requestUrl.searchParams.get('perPage')) || undefined
      const records = recordsForCollection(collectionName, requestUrl, state)

      if (collectionName === 'posts' && isSavedPostSummaryRequest(requestUrl) && state.delaySavedPostSummariesMs) {
        await new Promise((resolve) => setTimeout(resolve, state.delaySavedPostSummariesMs))
      }

      await fulfillJson(route, pageResponse(records, perPage))
      return
    }

    const mutationResponse = await applyCollectionMutation(
      state,
      request.method(),
      requestUrl,
      request.method() === 'DELETE' ? undefined : (request.postDataJSON() as Record<string, unknown>)
    )

    if (mutationResponse.status !== 404 || mutationResponse.body !== null) {
      await fulfillJson(route, mutationResponse.body, mutationResponse.status)
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

type BatchRequest = {
  method: string
  url: string
  body?: Record<string, unknown>
}

type BatchPayload = {
  requests?: BatchRequest[]
}

function parseBatchPayload(request: { postData(): string | null; postDataJSON(): unknown }) {
  let jsonBody: unknown = null

  try {
    jsonBody = request.postDataJSON()
  } catch {
    // Fall back to parsing form-encoded batch payloads below.
  }

  const jsonPayload = tryParseBatchPayload(jsonBody)

  if (jsonPayload) {
    return jsonPayload
  }

  const rawPostData = request.postData() ?? ''

  if (!rawPostData) {
    return { requests: [] }
  }

  const formPayload = tryParseBatchPayloadFromFormData(rawPostData)

  if (formPayload) {
    return formPayload
  }

  return null
}

function tryParseBatchPayload(payload: unknown): BatchPayload | null {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  if ('requests' in payload && Array.isArray((payload as BatchPayload).requests)) {
    return payload as BatchPayload
  }

  if ('@jsonPayload' in payload && typeof (payload as { '@jsonPayload'?: unknown })['@jsonPayload'] === 'string') {
    try {
      return JSON.parse((payload as { '@jsonPayload': string })['@jsonPayload']) as BatchPayload
    } catch {
      return null
    }
  }

  return null
}

function tryParseBatchPayloadFromFormData(rawPostData: string): BatchPayload | null {
  const searchParams = new URLSearchParams(rawPostData)
  const searchParamPayload = searchParams.get('@jsonPayload')

  if (searchParamPayload) {
    try {
      return JSON.parse(searchParamPayload) as BatchPayload
    } catch {
      return null
    }
  }

  const multipartMatch = rawPostData.match(/name="@jsonPayload"[\s\S]*?\r?\n\r?\n([\s\S]*?)\r?\n--/)

  if (!multipartMatch) {
    return null
  }

  try {
    return JSON.parse(multipartMatch[1]) as BatchPayload
  } catch {
    return null
  }
}

async function applyCollectionMutation(
  state: PocketBaseMockState,
  method: string,
  requestUrl: URL,
  payload?: Record<string, unknown>
): Promise<{ status: number; body: unknown }> {
  const collectionMatch = requestUrl.pathname.match(/^\/api\/collections\/([^/]+)\/records(?:\/([^/]+))?$/)

  if (!collectionMatch) {
    return {
      status: 404,
      body: { message: `Unhandled PocketBase mock route: ${method} ${requestUrl.pathname}${requestUrl.search}` }
    }
  }

  const [, collectionName, recordId] = collectionMatch

  if (method === 'POST') {
    return createCollectionRecord(state, collectionName, payload ?? {})
  }

  if ((method === 'PATCH' || method === 'PUT') && recordId) {
    return updateCollectionRecord(state, collectionName, recordId, payload ?? {})
  }

  if (method === 'DELETE' && recordId) {
    return deleteCollectionRecord(state, collectionName, recordId)
  }

  return {
    status: 404,
    body: { message: `Unhandled PocketBase mock mutation: ${method} ${requestUrl.pathname}${requestUrl.search}` }
  }
}

function createCollectionRecord(state: PocketBaseMockState, collectionName: string, payload: Record<string, unknown>) {
  if (collectionName === 'posts') {
    const record: IPocketbasePost = {
      ...(payload as IPocketbasePost),
      id: `saved-post-${state.savedPostRecords.length + 1}`
    }

    if (state.delaySavedPostMutationMs) {
      return new Promise<{ status: number; body: unknown }>((resolve) => {
        setTimeout(() => {
          state.savedPostRecords.push(record)
          state.savedPostSummaries.push({
            id: record.id!,
            original_id: record.original_id,
            original_domain: record.original_domain
          })

          resolve({ status: 200, body: record })
        }, state.delaySavedPostMutationMs)
      })
    }

    state.savedPostRecords.push(record)
    state.savedPostSummaries.push({
      id: record.id!,
      original_id: record.original_id,
      original_domain: record.original_domain
    })

    return { status: 200, body: record }
  }

  if (collectionName === 'tag_collections') {
    const record: PocketBaseRecord = {
      ...payload,
      id: `tag-collection-${state.tagCollectionRecords.length + 1}`
    }

    state.tagCollectionRecords.push(record)

    return { status: 200, body: record }
  }

  if (collectionName === 'boorus') {
    const record: PocketBaseRecord = {
      ...payload,
      id: `booru-${state.booruRecords.length + 1}`
    }

    state.booruRecords.push(record)

    return { status: 200, body: record }
  }

  if (collectionName === 'tag_blocklists') {
    const record: PocketBaseRecord = {
      ...payload,
      id: `tag-blocklist-${state.blockListRecords.length + 1}`
    }

    state.blockListRecords.push(record)

    return { status: 200, body: record }
  }

  return {
    status: 404,
    body: { message: `Unhandled PocketBase mock create: ${collectionName}` }
  }
}

function updateCollectionRecord(
  state: PocketBaseMockState,
  collectionName: string,
  recordId: string,
  payload: Record<string, unknown>
): { status: number; body: unknown } {
  const records = recordsForMutableCollection(collectionName, state)
  const index = records.findIndex((record) => record.id === recordId)

  if (index === -1) {
    return { status: 404, body: { message: `Record not found: ${recordId}` } }
  }

  records[index] = {
    ...records[index],
    ...payload
  }

  if (collectionName === 'posts') {
    const updatedRecord = records[index] as IPocketbasePost
    state.savedPostSummaries = state.savedPostSummaries.map((summary) =>
      summary.id === recordId
        ? {
            id: updatedRecord.id!,
            original_id: updatedRecord.original_id,
            original_domain: updatedRecord.original_domain
          }
        : summary
    )
  }

  return { status: 200, body: records[index] }
}

function deleteCollectionRecord(
  state: PocketBaseMockState,
  collectionName: string,
  recordId: string
): { status: number; body: unknown } {
  if (collectionName === 'posts') {
    const existingRecord = state.savedPostRecords.find((record) => record.id === recordId)

    if (!existingRecord) {
      return { status: 404, body: { message: `Record not found: ${recordId}` } }
    }

    state.savedPostRecords = state.savedPostRecords.filter((record) => record.id !== recordId)
    state.savedPostSummaries = state.savedPostSummaries.filter((record) => record.id !== recordId)

    return { status: 200, body: {} }
  }

  const records = recordsForMutableCollection(collectionName, state)
  const nextRecords = records.filter((record) => record.id !== recordId)

  if (nextRecords.length === records.length) {
    return { status: 404, body: { message: `Record not found: ${recordId}` } }
  }

  assignMutableCollection(collectionName, state, nextRecords)

  return { status: 200, body: {} }
}

function recordsForMutableCollection(collectionName: string, state: PocketBaseMockState) {
  switch (collectionName) {
    case 'posts':
      return state.savedPostRecords
    case 'tag_collections':
      return state.tagCollectionRecords
    case 'boorus':
      return state.booruRecords
    case 'tag_blocklists':
      return state.blockListRecords
    default:
      return [] as PocketBaseRecord[]
  }
}

function assignMutableCollection(collectionName: string, state: PocketBaseMockState, records: PocketBaseRecord[]) {
  switch (collectionName) {
    case 'tag_collections':
      state.tagCollectionRecords = records
      return
    case 'boorus':
      state.booruRecords = records
      return
    case 'tag_blocklists':
      state.blockListRecords = records
      return
  }
}
