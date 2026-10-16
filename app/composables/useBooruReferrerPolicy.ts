import { ORIGIN_REFERRER_DOMAINS } from '~/assets/js/media-resilience'

/**
 * One always-present `<meta name="referrer">` driven by the current route. `<video>` cannot set its own referrer
 * policy, so the page policy carries the e621 agreement (see ORIGIN_REFERRER_DOMAINS). It must never disappear on
 * navigation: removing a referrer meta does not revert the document policy.
 *
 * Do not give the tag a `key`: the server-rendered tag has none, so the client would add a second tag instead of
 * adopting it.
 */
export function useBooruReferrerPolicy() {
  // The router's own route flips when navigation resolves; `useRoute()` outside a page only updates after the new
  // page rendered, by which time its media requests have already gone out under the previous policy.
  const route = useRouter().currentRoute

  const policy = computed(() => {
    const domain = route.value.params.domain
    const isPostsRoute = route.value.path.split('/').includes('posts')

    return isPostsRoute && typeof domain === 'string' && ORIGIN_REFERRER_DOMAINS.includes(domain)
      ? 'origin'
      : 'no-referrer'
  })

  useHead({ meta: [{ name: 'referrer', content: policy }] })
}
