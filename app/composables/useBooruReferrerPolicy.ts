import { ORIGIN_REFERRER_DOMAINS } from '~/assets/js/media-resilience'

// <video> cannot set its own referrerpolicy, so the page policy carries the e621 agreement (see ORIGIN_REFERRER_DOMAINS).

/**
 * One always-present `<meta name="referrer">` driven by the current route. It must never disappear on navigation:
 * removing a referrer meta does not revert the document policy, so leaving an e621 page would keep sending the origin.
 *
 * Server: rendered into the HTML. Client: the existing tag is updated in place (or created for CSR-only pages),
 * because unhead appended a second tag instead of adopting the server-rendered one on hydration.
 */
export function useBooruReferrerPolicy() {
  const route = useRoute()

  const policy = computed(() => {
    const domain = route.params.domain
    const isPostsRoute = route.path.split('/').includes('posts')

    return isPostsRoute && typeof domain === 'string' && ORIGIN_REFERRER_DOMAINS.includes(domain)
      ? 'origin'
      : 'no-referrer'
  })

  if (import.meta.server) {
    useHead({ meta: [{ name: 'referrer', content: policy.value }] })
    return
  }

  function applyPolicy() {
    let meta = document.head.querySelector<HTMLMetaElement>('meta[name="referrer"]')

    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'referrer'
      document.head.append(meta)
    }

    meta.content = policy.value
  }

  onMounted(applyPolicy)
  watch(policy, applyPolicy)
}
