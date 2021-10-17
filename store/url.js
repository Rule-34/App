import { RouterHelper } from '~/assets/js/RouterHelper'

export const getters = {
  urlDomain(state, getters, rootState, rootGetters) {
    const { domain } = rootState.route.query

    return domain
  },

  urlPage(state, getters, rootState, rootGetters) {
    const { page } = rootState.route.query

    return page
  },

  urlTags(state, getters, rootState, rootGetters) {
    const { tags } = rootState.route.query

    return tags
  },
}

export const actions = {
  async pushRouteQueries(context, { domain, page, tags }) {
    const { rootGetters } = context

    const shouldReplaceHistory =
      domain === undefined && page === undefined && tags === undefined

    // Get applied domain or default domain
    if (domain === undefined) {
      domain = rootGetters['booru/getActiveBooru'].domain
    }

    // Get applied page or default page
    if (page === undefined) {
      page = rootGetters['booru/getPageID']
    }

    // Get applied tags
    if (tags === undefined) {
      tags = rootGetters['booru/getTags']
    }

    const ROUTE = RouterHelper.generatePostsRoute(domain, page, tags)

    if (shouldReplaceHistory) {
      await this.$router.replace(ROUTE)
    } else {
      await this.$router.push(ROUTE)
    }
  },
}
