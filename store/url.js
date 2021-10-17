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
    const ROUTE = RouterHelper.generatePostsRouteWithDefaults(
      context,
      domain,
      page,
      tags
    )

    await this.$router.push(ROUTE)
  },
}
