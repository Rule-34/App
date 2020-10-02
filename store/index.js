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
  /**
   * Simple fetch that returns error to vue store
   * @param {*} param0
   * @param {String} url URL to fetch
   */
  async simpleFetch({ state, dispatch }, { url, options }) {
    dispatch('loadingAnimationHandler', 'start')

    if (state.errors) {
      await dispatch({
        type: 'errorManager',
        operation: 'reset',
      })
    }

    const data = await fetch(url, options)
      // Save the data
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request rejected with status ${response.status}`)
        }

        return response.json()
      })

      .catch((error) => {
        dispatch({
          type: 'errorManager',
          operation: 'set',
          value: error.message,
        })

        return false
      })

    dispatch('loadingAnimationHandler', 'finish')

    return data
  },

  errorManager({ commit }, { operation, value }) {
    switch (operation) {
      case 'set':
        commit('setErrors', value)
        break

      case 'reset':
        commit('setErrors', undefined)
        break

      default:
        throw new Error('No operation specified')
    }
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
