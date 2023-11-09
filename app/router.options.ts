import type { RouterConfig } from '@nuxt/schema'
import qs from 'qs'

// https://router.vuejs.org/api/interfaces/routeroptions.html
export default <RouterConfig>{
  // Fix router query parser - https://github.com/vuejs/vue-router/issues/1259#issuecomment-1571553624
  parseQuery: qs.parse,

  stringifyQuery: qs.stringify,

  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return {
        top: 0
      }
    }
  }
}
