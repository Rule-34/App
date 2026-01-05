import type {DehydratedState, VueQueryPluginOptions} from '@tanstack/vue-query'
import {dehydrate, hydrate, QueryClient, VueQueryPlugin} from '@tanstack/vue-query'
import {defineNuxtPlugin, useState} from '#imports'

/**
 * @see https://github.com/TanStack/query/blob/main/examples/vue/nuxt3/plugins/vue-query.ts
 */
export default defineNuxtPlugin({
  parallel: true,
  setup(nuxtApp) {
    const vueQueryState = useState<DehydratedState | null>('vue-query')

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          // Do not refetch
          refetchOnMount: false,
          refetchOnWindowFocus: false,
          refetchOnReconnect: false,
          refetchIntervalInBackground: false,
          refetchInterval: false,

          // Disable retries, it is handled by Nuxt
          retry: false
        }
      }
    })
    const options: VueQueryPluginOptions = { queryClient }

    nuxtApp.vueApp.use(VueQueryPlugin, options)

    if (import.meta.server) {
      nuxtApp.hooks.hook('app:rendered', () => {
        vueQueryState.value = dehydrate(queryClient)
      })
    }

    if (import.meta.client) {
      nuxtApp.hooks.hook('app:created', () => {
        hydrate(queryClient, vueQueryState.value)
      })
    }
  }
})
