import createPersistedState from 'vuex-persistedstate'

export default ({ store }) => {
  const SETTINGS_ARRAY = [
    'dashBoardSettings',
    'notificationData'
    // 'userSettings'
  ]

  Object.keys(store.state.userSettings).forEach((key) => {
    SETTINGS_ARRAY.push(`userSettings.${key}.value`)
  })

  console.log(SETTINGS_ARRAY)

  // Hydrate data
  window.onNuxtReady(() => {
    createPersistedState({
      key: 'vuex',
      paths: SETTINGS_ARRAY
    })(store)
  })
}
