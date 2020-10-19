export const state = () => ({
  general: {
    CORSProxyURL: 'https://cors-proxy.r34.app/',
  },

  errors: undefined,

  statistics: {
    timesTheAppHasBeenOpened: 0,
  },
})

export const getters = {
  getCORSProxyURL(state) {
    return state.general.CORSProxyURL
  },

  getErrors(state) {
    return state.errors
  },

  getTimesTheAppHasBeenOpened(state) {
    return state.statistics.timesTheAppHasBeenOpened
  },
}

export const mutations = {
  setErrors(state, value) {
    state.errors = value
  },

  setTimesTheAppHasBeenOpened(state, value) {
    state.statistics.timesTheAppHasBeenOpened = value
  },
}

export const actions = {
  async simpleFetch({ state, dispatch }, { url, options }) {
    dispatch('loadingAnimationHandler', 'start')

    if (state.errors) {
      dispatch({
        type: 'errorManager',
        operation: 'reset',
      })
    }

    try {
      const response = await fetch(url, options)

      if (!response.ok) {
        throw new Error(`Request rejected with status ${response.status}`)
      }

      return response.json()

      //
    } finally {
      dispatch('loadingAnimationHandler', 'finish')
    }
  },

  errorManager({ commit, dispatch }, { operation, value, message }) {
    switch (operation) {
      case 'set':
        commit('setErrors', message || value.message)

        dispatch({
          type: 'errorSender',
          error: value,
        })
        break

      case 'reset':
        commit('setErrors', undefined)
        break

      default:
        throw new Error('No operation specified')
    }
  },

  errorSender(_, { error }) {
    window.$nuxt.$sentry.captureException(error)
  },

  loadingAnimationHandler(_, mode) {
    if (!window.$nuxt.$root.$loading.start) {
      console.debug('Skipping animation until everything is loaded')
      return
    }

    switch (mode) {
      case 'start':
        console.debug('Starting loading animation')

        window.$nuxt.$root.$loading.start()
        break

      case 'finish':
        console.debug('Stopping loading animation')

        window.$nuxt.$root.$loading.finish()
        break

      default:
        throw new Error('No mode specified')
    }
  },
}
