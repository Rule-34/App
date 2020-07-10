export const state = () => ({
  sideNav: {
    isActive: false,
  },

  search: {
    isActive: false,
  },
})

export const getters = {}

export const mutations = {
  setSideNavActive(state, value) {
    state.sideNav.isActive = value
  },

  setSearchActive(state, value) {
    state.search.isActive = value
  },
}

export const actions = {}
