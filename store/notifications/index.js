export const state = () => ({
  notifications: {
    url:
      'https://cdn.statically.io/gist/AlejandroAkbal/2fe43e0eee40be63d9b2a582b2793cf9/raw/app-notifications.json',

    data: undefined,

    latestTitle: undefined, // This is saved to localStorage
  },
})

export const getters = {
  getNotifications(state) {
    return state.notifications.data
  },

  hasNotificationsBeenFetched(state) {
    return !!state.notifications.data
  },

  isThereANewNotification(state) {
    if (!state.notifications.data) return false

    if (!state.notifications.latestTitle) return true

    const areTitlesEqual = state.notifications.latestTitle.localeCompare(
      state.notifications.data[0].title
    )

    // Equal to 0 means they are identical
    return areTitlesEqual !== 0
  },
}

export const mutations = {
  setNotificationData(state, value) {
    state.notifications.data = Object.freeze(value)
  },

  setLatestTitle(state, value) {
    state.notifications.latestTitle = value
  },
}

export const actions = {
  async fetchNotifications({ state, dispatch, commit }) {
    const response = await dispatch(
      'simpleFetch',
      {
        url: state.notifications.url,
      },
      { root: true } // Necessary for talking to root actions
    )

    // console.log(response)
    commit('setNotificationData', response)
  },
}
