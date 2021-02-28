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
  async setInitialUrlState(context) {
    const { dispatch } = context

    await dispatch('pushRouteQueries', {})
  },

  async pushRouteQueries(context, { domain, page, tags }) {
    const { rootGetters } = context

    if (domain === undefined) {
      domain = rootGetters['booru/getActiveBooru'].domain
    }

    if (page === undefined) {
      page = rootGetters['booru/getPageID']
    }

    if (tags === undefined) {
      tags = rootGetters['booru/getTags']
    }

    const routerQueries = {
      query: {
        domain,
        page,
        ...(tags.length && {
          tags: tags.join(','),
        }),
      },
    }

    await this.$router.push(routerQueries)
  },
}
