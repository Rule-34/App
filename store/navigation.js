export const state = () => ({
  sideNav: {
    isActive: false
  },

  search: {
    isActive: false
  }
})

export const getters = {
  isSideNavActive(state) {
    return state.sideNav.isActive
  },

  isSearchActive(state) {
    return state.search.isActive
  }
}

export const mutations = {
  setSideNavIsActive(state, value) {
    state.sideNav.isActive = value
  },

  setSearchIsActive(state, value) {
    state.search.isActive = value
  }
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
  }
}
