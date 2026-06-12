import { FetchError } from 'ofetch'

export function shouldReportTagSearchError(error: unknown) {
  return !(error instanceof FetchError)
}
