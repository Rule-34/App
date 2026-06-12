import { FetchError } from 'ofetch'

export function shouldReportTagSearchError(error: unknown): boolean {
  return !(error instanceof FetchError)
}
