import {defineNuxtPlugin} from '#app'
import type {PostHog} from 'posthog-js'
import posthog from 'posthog-js'

// TODO: Refactor so this is loaded only when the user has given consent
export default defineNuxtPlugin(nuxtApp => {
  const runtimeConfig = useRuntimeConfig()
  const router = useRouter()

  let posthogClient: PostHog | null = null

  window.addEventListener('cc:onConsent', ({detail}) => {

    const cookie = detail.cookie

    if (!cookie.services.analytics.includes('posthog')) {
      return
    }

    // console.debug('PostHog consent given')

    if (!posthogClient) {
      posthogClient = posthog.init(runtimeConfig.public.POSTHOG_PUBLIC_KEY,
        {
          api_host: runtimeConfig.public.POSTHOG_HOST,

          // we add manual pageview capturing below
          capture_pageview: false,

          // loaded: (posthog) => {
          //   if (import.meta.env.MODE === 'development') posthog.debug()
          // }
        })
    }
  })

  // Make sure that pageviews are captured with each route change
  router.afterEach((to) => {
    if (!posthogClient) {
      return
    }

    nextTick(() => {
      posthog.capture('$pageview', {
        current_url: to.fullPath
      })
    })
  })

  return {
    provide: {
      posthog: () => posthogClient
    }
  }
})
