import {
  booruTypeList,
  defaultBooruList,
  findBoorusWithValueByKey,
} from '~/assets/lib/rule-34-shared-resources/src/util/BooruUtils.js'
import { RouterHelper } from '~/assets/js/RouterHelper'

export const state = () => ({
  history: {
    lastDomainUsed: defaultBooruList[0].domain,
  },

  posts: {
    data: [],
  },
})

export const getters = {
  // Used for premium separation
  getDefaultBooruList: () => {
    return defaultBooruList
  },

  // Used for premium separation
  getPremiumBooruList: (state, getters, rootState, rootGetters) => {
    return rootGetters['user/getCustomBoorus']
  },

  // Used internally as a complete list of boorus
  getBooruList: (state, getters) => {
    return [...getters.getDefaultBooruList, ...getters.getPremiumBooruList]
  },

  getActiveBooru(state, getters, rootState, rootGetters) {
    const domain = rootGetters['url/urlDomain']

    // Set default booru
    if (domain === undefined) {
      return findBoorusWithValueByKey(
        state.history.lastDomainUsed,
        'domain',
        getters.getBooruList
      )[0]
    }

    return findBoorusWithValueByKey(domain, 'domain', getters.getBooruList)[0]
  },

  getActiveBooruType: (state, getters, rootState, rootGetters) => {
    return findBoorusWithValueByKey(
      getters.getActiveBooru.type,
      'type',
      booruTypeList
    )[0]
  },

  getPosts: (state) => {
    return state.posts.data
  },

  getPageID: (state, getters, rootState, rootGetters) => {
    const pageID = rootGetters['url/urlPage']

    // Get default value
    if (pageID === undefined) {
      return getters.getActiveBooruType.initialPageID
    }

    return Number(pageID)
  },

  getTags: (state, getters, rootState, rootGetters) => {
    const tags = rootGetters['url/urlTags']

    // Set default value
    if (tags === undefined) {
      return []
    }

    return tags.split(',')
  },
}

export const mutations = {
  setLastDomainUsed(state, value) {
    state.history.lastDomainUsed = value
  },

  setPostsData(state, value) {
    state.posts.data = Object.freeze(value)
  },
}

export const actions = {
  async activeBooruManager(context, { operation, value }) {
    const { dispatch, commit, getters } = context

    switch (operation) {
      case 'set': {
        const booru = findBoorusWithValueByKey(
          value,
          'domain',
          getters.getBooruList
        )[0]

        commit('setLastDomainUsed', booru.domain)

        const ROUTE = RouterHelper.generatePostsRouteWithDefaults(
          context,
          booru.domain
        )

        await dispatch('url/pushRoute', ROUTE, { root: true })
        break
      }

      default:
        throw new Error('No operation specified')
    }
  },

  postsManager({ state, commit }, { operation, value }) {
    switch (operation) {
      case 'set':
        commit('setPostsData', value)
        break

      case 'concat': {
        const uniqueMergedPosts = [...new Set([...state.posts.data, ...value])]

        commit('setPostsData', uniqueMergedPosts)
        break
      }

      default:
        throw new Error('No operation specified')
    }
  },

  async pidManager(context, { operation, value }) {
    const { dispatch } = context

    switch (operation) {
      case 'set': {
        const ROUTE = RouterHelper.generatePostsRouteWithActiveDefaults(
          context,
          undefined,
          value
        )

        await dispatch('url/pushRoute', ROUTE, { root: true })
        break
      }

      default:
        throw new Error('No operation specified')
    }
  },

  /**
   * @param {*} context
   * @param {Object} options
   * @param {string} options.operation
   * @param {string[]} options.value
   */
  async tagsManager(context, { operation, value }) {
    const { dispatch } = context

    switch (operation) {
      case 'set': {
        const ROUTE = RouterHelper.generatePostsRouteWithDefaults(
          context,
          undefined,
          undefined,
          value
        )

        await dispatch('url/pushRoute', ROUTE, { root: true })
        break
      }

      default:
        throw new Error('No operation specified')
    }
  },

  // TODO: This should be handled by an API library
  createApiUrl(context, { mode, postID, tag }) {
    const { getters, rootState } = context

    const apiUrl = this.app.$config.API_URL

    const activeBooru = getters.getActiveBooru

    const queries = {
      posts: {
        limit: rootState.user.settings.postsPerPage.value,
        pageID: getters.getPageID,
        tags: getters.getTags.join(','),
        score: rootState.user.settings.score.value,
      },

      singlePost: {
        id: postID,
      },

      tags: { tag, limit: 15, order: 'count' },
    }

    const urlToFetch = new URL(
      apiUrl + '/booru/' + activeBooru.type + '/' + mode
    )

    urlToFetch.searchParams.append('baseEndpoint', activeBooru.domain)

    switch (mode) {
      case 'posts':
        if (queries.posts.limit) {
          urlToFetch.searchParams.append('limit', queries.posts.limit)
        }

        if (queries.posts.pageID) {
          urlToFetch.searchParams.append('pageID', queries.posts.pageID)
        }

        if (queries.posts.tags && queries.posts.tags.length) {
          urlToFetch.searchParams.append('tags', queries.posts.tags)
        }

        if (queries.posts.score) {
          urlToFetch.searchParams.append('score', '>=' + queries.posts.score)
        }
        break

      case 'tags':
        urlToFetch.searchParams.append('tag', queries.tags.tag)

        if (queries.tags.order) {
          urlToFetch.searchParams.append('order', queries.tags.order)
        }

        if (queries.tags.limit) {
          urlToFetch.searchParams.append('limit', queries.tags.limit)
        }
        break

      default:
        throw new Error('No mode specified')
    }

    if (activeBooru.config) {
      if (activeBooru.config?.options?.HTTPScheme) {
        urlToFetch.searchParams.append(
          'httpScheme',
          activeBooru.config.options.HTTPScheme
        )
      }

      if (activeBooru.config?.endpoints?.tags) {
        urlToFetch.searchParams.append(
          'tagsEndpoint',
          activeBooru.config.endpoints.tags
        )
      }

      if (activeBooru.config?.queryIdentifiers?.tags?.tag) {
        urlToFetch.searchParams.append(
          'defaultQueryIdentifiersTagsTag',
          activeBooru.config.queryIdentifiers.tags.tag
        )
      }

      if (activeBooru.config?.queryIdentifiers?.tags?.tagEnding !== undefined) {
        urlToFetch.searchParams.append(
          'defaultQueryIdentifiersTagsTagEnding',
          activeBooru.config.queryIdentifiers.tags.tagEnding
        )
      }
    }

    return urlToFetch.toString()
  },

  async fetchPosts({ getters, dispatch }, mode) {
    // Tip: Actions that return a value have to be awaited
    const url = await dispatch('createApiUrl', { mode: 'posts' })

    const ACTIVE_BOORU_DOMAIN = getters.getActiveBooru.domain

    try {
      const response = await dispatch(
        'simpleFetch',
        {
          url,
        },
        { root: true }
      )

      // This is how a final booru object looks like
      const POSTS = response.map((POST) => {
        return {
          id: `${ACTIVE_BOORU_DOMAIN}-${POST.id}`,
          data: POST,
          meta_data: {
            booru_domain: ACTIVE_BOORU_DOMAIN,
            created_at: null,
          },
        }
      })

      if (mode === 'concat') {
        dispatch('postsManager', { operation: 'concat', value: POSTS })
      } else {
        dispatch('postsManager', { operation: 'set', value: POSTS })
      }

      //
    } catch (error) {
      dispatch(
        'errorManager',
        {
          operation: 'set',
          value: error,
          message: 'Could not fetch posts.',
        },
        { root: true }
      )
    }
  },

  async fetchTags({ getters, dispatch }, tag) {
    const url = await dispatch('createApiUrl', { mode: 'tags', tag })

    const ACTIVE_BOORU_DOMAIN = getters.getActiveBooru.domain

    try {
      const response = await dispatch(
        'simpleFetch',
        {
          url,
        },
        { root: true }
      )

      // This is how a final Booru Tag object looks like
      const TAGS = response.map((TAG) => {
        return {
          id: `${ACTIVE_BOORU_DOMAIN}-${TAG.name}`,
          name: TAG.name,
          count: TAG.count,
        }
      })

      return TAGS

      //
    } catch (error) {
      dispatch(
        'errorManager',
        {
          operation: 'set',
          value: error,
          message: 'Could not fetch search tags.',
        },
        { root: true }
      )
    }
  },
}
