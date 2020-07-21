export const state = () => ({
  sideNav: {
    isActive: false,
  },

  search: {
    isActive: false,
  },
})

export const mutations = {
  setSideNavIsActive(state, value) {
    state.sideNav.isActive = value
  },

  setSearchIsActive(state, value) {
    state.search.isActive = value
  },
}
