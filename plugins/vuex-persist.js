import createPersistedState from 'vuex-persistedstate'

export default ({ store }) => {
  const SETTINGS_ARRAY = [
    // Dashboard
    'dashBoardSettings',
    // Notifications
    'notificationData.data',
    'notificationData.latestTitle',
    // 'userSettings'

    // Patreon data
    'patreonCredentials',
  ]

  // Push every setting's value path to save them to localStorage (this way we dont save other data like titles, defaultValue, etc.)
  Object.keys(store.state.userSettings).forEach((key) => {
    SETTINGS_ARRAY.push(`userSettings.${key}.value`)
  })

  // console.log(SETTINGS_ARRAY)

  // Hydrate data
  window.onNuxtReady(() => {
    createPersistedState({
      key: 'vuex',
      paths: SETTINGS_ARRAY,
    })(store)
  })
}
