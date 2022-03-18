export const state = () => ({
  errors: undefined,

  statistics: {
    timesTheAppHasBeenOpened: 0,
  },
})

export const getters = {
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
    if (state.errors) {
      dispatch({
        type: 'errorManager',
        operation: 'reset',
      })
    }

    const response = await this.$axios.$get(url, {
      headers: {
        'Authorization': this.$auth.strategy.token.get()
      },
      ...options
    })

    return response
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
}
