import { defineNuxtPlugin } from '#imports'
import formbricks from '~/assets/js/formbricks'

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()

  router.afterEach((to, from) => {
    if (typeof formbricks !== 'undefined') {
      formbricks.registerRouteChange()
    }
  })

  return {
    parallel: true
  }
})
