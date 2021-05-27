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

    console.debug('Setting initial URL state')

    await dispatch('pushRouteQueries', {})
  },

  async pushRouteQueries(context, { domain, page, tags }) {
    const { rootGetters } = context

    const shouldReplaceHistory =
      domain === undefined && page === undefined && tags === undefined

    if (domain === undefined) {
      domain = rootGetters['booru/getActiveBooru'].domain
    }

    if (page === undefined) {
      page = rootGetters['booru/getPageID']
    }

    if (tags === undefined) {
      tags = rootGetters['booru/getTags']
    }

    const routerLocation = {
      query: {
        domain,
        page,
      },
    }

    if (tags.length) {
      routerLocation.query.tags = tags.join(',')
    }

    if (!shouldReplaceHistory) {
      await this.$router.push(routerLocation)
    } else {
      await this.$router.replace(routerLocation)
    }
  },
}
