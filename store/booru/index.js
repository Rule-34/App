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

    blacklistFilter: { isActive: false },
  },
})

export const getters = {
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

  // Used internally for state
  getBooruList: (state, getters) => {
    return [...getters.getDefaultBooruList, ...getters.getPremiumBooruList]
  },

  // Used for premium separation
  getDefaultBooruList: () => {
    return defaultBooruList
  },

  // Used for premium separation
  getPremiumBooruList: (state, getters, rootState, rootGetters) => {
    return rootState.user.custom.boorus
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
    state.posts.data = value
  },

  setAddedTags(state, value) {
    state.search.addedTags = value
  },

  pushAddedTags(state, value) {
    state.search.addedTags.push(value)
  },

  setSearchedTags(state, value) {
    state.search.searchedTags = value
  },

  setBlacklistFilterActive(state, value) {
    state.search.blacklistFilter.isActive = value
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

      case 'concat':
        commit('setPostsData', [...new Set([...state.posts.data, ...value])])
        break

      default:
        throw new Error('No operation specified')
    }
  },

  pidManager({ state, commit, getters }, { operation, value }) {
    switch (operation) {
      case 'add':
        commit('setPIDQuery', state.queries.pid + 1)
        break

      case 'subtract':
        commit('setPIDQuery', state.queries.pid - 1)
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

  addedTagsManager({ state, commit }, { operation, value }) {
    switch (operation) {
      case 'add':
        // value: string
        if (!state.search.addedTags.includes(value))
          commit('pushAddedTags', value)
        break

      case 'concat':
        // value: string[]
        commit('setAddedTags', state.search.addedTags.concat(value))
        break

      case 'remove':
        // value: string
        commit(
          'setAddedTags',
          state.search.addedTags.filter((tag) => {
            return tag !== value
          })
        )
        break

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

  async fetchPosts({ dispatch, commit }, mode) {
    const url = await dispatch('createAPIURL', { mode: 'posts' })

    const response = await dispatch(
      'simpleFetch',
      {
        url,
      },
      { root: true }
    )

    if (mode === 'concat') {
      await dispatch('postsManager', { operation: 'concat', value: response })
    } else {
      await dispatch('postsManager', { operation: 'set', value: response })
    }
  },

  async fetchSearchTag({ dispatch, commit }, tag) {
    const url = await dispatch('createAPIURL', { mode: 'tags', tag })

    const response = await dispatch(
      'simpleFetch',
      {
        url,
      },
      { root: true }
    )

    commit('setSearchedTags', response)
  },
}
