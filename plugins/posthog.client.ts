import {defineNuxtPlugin} from '#app'
import posthog from 'posthog-js'

export default defineNuxtPlugin(nuxtApp => {
  const runtimeConfig = useRuntimeConfig()
  const posthogClient = posthog.init(runtimeConfig.public.POSTHOG_PUBLIC_KEY,
    {
      persistence: 'localStorage',

      api_host: runtimeConfig.public.POSTHOG_HOST,

      // we add manual pageview capturing below
      capture_pageview: false,

      // loaded: (posthog) => {
      //   if (import.meta.env.MODE === 'development') posthog.debug()
      // }
    })

  // Make sure that pageviews are captured with each route change
  const router = useRouter()
  router.afterEach((to) => {
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
