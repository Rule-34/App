export const state = () => ({
  sideNav: {
    isActive: false,
  },

  search: {
    isActive: false,

    negativeTags: { isActive: false },
    tagCollections: { isActive: false },
  },
})

export const getters = {
  isSideNavActive(state) {
    return state.sideNav.isActive
  },

  isSearchActive(state) {
    return state.search.isActive
  },

  isNegativeTagsActive(state) {
    return state.search.negativeTags.isActive
  },

  isTagCollectionsActive(state) {
    return state.search.tagCollections.isActive
  },
}

export const mutations = {
  setSideNavIsActive(state, value) {
    state.sideNav.isActive = value
  },

  setSearchIsActive(state, value) {
    state.search.isActive = value
  },

  setSearchNegativeTagsIsActive(state, value) {
    state.search.negativeTags.isActive = value
  },

  setSearchTagCollectionsIsActive(state, value) {
    state.search.tagCollections.isActive = value
  },
}

export const actions = {
  sideNavNavigationManager({ commit, getters }, { operation, value }) {
    switch (operation) {
      case 'toggle':
        commit('setSideNavIsActive', !getters.isSideNavActive)
        break

      case 'set':
        commit('setSideNavIsActive', value)
        break

      default:
        throw new Error('No operation specified')
    }
  },

  searchNavigationManager({ commit, getters }, { operation, value }) {
    switch (operation) {
      case 'toggle':
        commit('setSearchIsActive', !getters.isSearchActive)
        break

      case 'set':
        commit('setSearchIsActive', value)
        break

      default:
        throw new Error('No operation specified')
    }
  },

  negativeTagsManager({ commit, getters }, { operation, value }) {
    switch (operation) {
      case 'toggle':
        commit('setSearchNegativeTagsIsActive', !getters.isNegativeTagsActive)
        break

      case 'set':
        commit('setSearchNegativeTagsIsActive', value)
        break

      default:
        throw new Error('No operation specified')
    }
  },

  tagCollectionsNavigationManager({ commit, getters }, { operation, value }) {
    switch (operation) {
      case 'toggle':
        commit(
          'setSearchTagCollectionsIsActive',
          !getters.isTagCollectionsActive
        )
        break

      case 'set':
        commit('setSearchTagCollectionsIsActive', value)
        break

      default:
        throw new Error('No operation specified')
    }
  },
}
