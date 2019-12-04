import createPersistedState from 'vuex-persistedstate'

export default ({ store }) => {
  // Hydrate data
  window.onNuxtReady(() => {
    createPersistedState({
      key: 'vuex',
      paths: ['dashBoardSettings', 'userSettings'],
    })(store)
  })
}
