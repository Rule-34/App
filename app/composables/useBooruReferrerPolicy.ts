// Per agreement, e621 gets the origin referrer; every other booru gets none.
// <video> cannot set its own referrerpolicy, so the page policy has to carry it.
const ORIGIN_REFERRER_DOMAINS = ['e621.net']

export function useBooruReferrerPolicy(domain: MaybeRefOrGetter<string | undefined>) {
  // Always rendered: removing a referrer meta does not revert the policy, so switching away must set it back explicitly
  useHead(() => ({
    meta: [
      {
        key: 'referrer',
        name: 'referrer',
        content: ORIGIN_REFERRER_DOMAINS.includes(toValue(domain) ?? '') ? 'origin' : 'no-referrer'
      }
    ]
  }))
}
