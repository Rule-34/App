import type { DehydratedState, VueQueryPluginOptions } from '@tanstack/vue-query'
import { dehydrate, hydrate, QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
// Nuxt 3 app aliases
import { defineNuxtPlugin, useState } from '#imports'

/**
 * @see https://github.com/TanStack/query/blob/main/examples/vue/nuxt3/plugins/vue-query.ts
 */
export default defineNuxtPlugin((nuxt) => {
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

				staleTime: 5000,

				// Disable retries, it is handled by Nuxt
				retry: false
			}
		}
	})
	const options: VueQueryPluginOptions = { queryClient }

	nuxt.vueApp.use(VueQueryPlugin, options)

	if (process.server) {
		nuxt.hooks.hook('app:rendered', () => {
			vueQueryState.value = dehydrate(queryClient)
		})
	}

	if (process.client) {
		nuxt.hooks.hook('app:created', () => {
			hydrate(queryClient, vueQueryState.value)
		})
	}
})
