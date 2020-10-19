import {
  booruList as defaultBooruList,
  findBoorusWithValueByKey,
  booruTypeList,
} from '~/assets/lib/rule-34-shared-resources/util/BooruUtils.js'

export const state = () => ({
  API: {
    url:
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:8100/'
        : 'https://api.r34.app/',
  },

  booru: {
    active: 0, // This is saved to localStorage
  },

  queries: {
    pid: undefined, // Initial PID is set on boot and is derived from the getActiveBooruType getter
  },

  posts: {
    data: [],
  },

  search: {
    addedTags: [],
    searchedTags: [],
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

  getActiveBooru(state, getters) {
    return getters.getBooruList[state.booru.active]
  },

  getActiveBooruType: (state, getters) => {
    return findBoorusWithValueByKey(
      getters.getActiveBooru.type,
      'type',
      booruTypeList
    )[0]
  },

  getPageID: (state) => {
    return state.queries.pid
  },

  getPosts: (state) => {
    return state.posts.data
  },

  getSearchAddedTags: (state) => {
    return state.search.addedTags
  },

  getSearchSearchedTags: (state) => {
    return state.search.searchedTags
  },
}

export const mutations = {
  setActiveBooru(state, value) {
    state.booru.active = value
  },

  setPIDQuery(state, value) {
    state.queries.pid = value
  },

  setPostsData(state, value) {
    state.posts.data = Object.freeze(value)
  },

  setAddedTags(state, value) {
    state.search.addedTags = Object.freeze(value)
  },

  setSearchedTags(state, value) {
    state.search.searchedTags = Object.freeze(value)
  },
}

export const actions = {
  activeBooruManager({ state, commit, getters }, { operation, value }) {
    switch (operation) {
      case 'search': {
        // Search for the domain
        const booruData = findBoorusWithValueByKey(
          value,
          'domain',
          getters.getBooruList
        )[0]

        const booruIndex = getters.getBooruList.indexOf(booruData) // findIndex could be used

        commit('setActiveBooru', booruIndex)
        break
      }

      case 'reset':
        commit('setActiveBooru', 0)
        break

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

  pidManager({ commit, getters }, { operation, value }) {
    switch (operation) {
      case 'add':
        commit('setPIDQuery', getters.getPageID + 1)
        break

      case 'subtract':
        commit('setPIDQuery', getters.getPageID - 1)
        break

      case 'set':
        commit('setPIDQuery', value)
        break

      case 'reset':
        commit('setPIDQuery', getters.getActiveBooruType.initialPageID)
        break

      default:
        throw new Error('No operation specified')
    }
  },

  addedTagsManager({ commit, getters }, { operation, value }) {
    switch (operation) {
      case 'add': {
        // value: string
        const isTheTagAlreadyAdded = getters.getSearchAddedTags.includes(value)

        if (isTheTagAlreadyAdded) {
          console.debug('This tag is already added!')
          return
        }

        const addedTagsWithNewTag = [...getters.getSearchAddedTags, value]

        commit('setAddedTags', addedTagsWithNewTag)
        break
      }

      case 'concat': {
        // value: string[]
        const uniqueMergedAddedTags = [
          ...new Set([...getters.getSearchAddedTags, ...value]),
        ]

        commit('setAddedTags', uniqueMergedAddedTags)
        break
      }

      case 'remove': {
        // value: string
        const addedTagsWithoutValue = getters.getSearchAddedTags.filter(
          (tag) => tag !== value
        )

        commit('setAddedTags', addedTagsWithoutValue)
        break
      }

      case 'reset':
        commit('setAddedTags', [])
        break

      default:
        throw new Error('No operation specified')
    }
  },

  searchedTagsManager({ commit }, { operation, value }) {
    switch (operation) {
      case 'set':
        commit('setSearchedTags', value)
        break

      case 'reset':
        commit('setSearchedTags', [])
        break

      default:
        throw new Error('No operation specified')
    }
  },

  createAPIURL({ getters, rootState }, { mode, postID, tag }) {
    const domainData = getters.getActiveBooru

    const queryObj = {
      posts: {
        limit: rootState.user.settings.postsPerPage.value,
        pid: rootState.booru.queries.pid,
        tags: rootState.booru.search.addedTags.join('+'),
        score: rootState.user.settings.score.value,
      },

      singlePost: {
        id: postID,
      },

      tags: { tag },
    }

    const url = new URL(
      rootState.booru.API.url + 'booru/' + domainData.type + '/' + mode
    )
    url.searchParams.append('domain', domainData.domain)

    switch (mode) {
      case 'posts':
        url.searchParams.append('limit', queryObj.posts.limit)
        url.searchParams.append('pid', queryObj.posts.pid)
        url.searchParams.append('tags', queryObj.posts.tags)
        url.searchParams.append('score', '>=' + queryObj.posts.score)
        break

      case 'single-post':
        url.searchParams.append('id', queryObj.singlePost.id)
        break

      case 'tags':
        url.searchParams.append('tag', queryObj.tags.tag)
        // url.searchParams.append('limit', queryObj.limit)
        break

      default:
        throw new Error('No mode specified')
    }

    if (domainData.config) {
      url.searchParams.append('config', JSON.stringify(domainData.config))
    }

    return url.toString()
  },

  async fetchPosts({ dispatch }, mode) {
    const url = await dispatch('createAPIURL', { mode: 'posts' }) // Tip: Actions that return a value have to be awaited

    try {
      const response = await dispatch(
        'simpleFetch',
        {
          url,
        },
        { root: true }
      )

      if (mode === 'concat') {
        dispatch('postsManager', { operation: 'concat', value: response })
      } else {
        dispatch('postsManager', { operation: 'set', value: response })
      }

      //
    } catch (error) {
      dispatch(
        'errorManager',
        {
          operation: 'set',
          value: error,
          message: "Couldn't fetch posts",
        },
        { root: true }
      )
    }
  },

  async fetchSearchTag({ dispatch, commit }, tag) {
    const url = await dispatch('createAPIURL', { mode: 'tags', tag })

    try {
      const response = await dispatch(
        'simpleFetch',
        {
          url,
        },
        { root: true }
      )

      commit('setSearchedTags', response)

      //
    } catch (error) {
      dispatch(
        'errorManager',
        {
          operation: 'set',
          value: error,
          message: "Couldn't fetch search tags",
        },
        { root: true }
      )
    }
  },
}
