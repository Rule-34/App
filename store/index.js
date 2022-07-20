export const state = () => ({
  version: 0,

  statistics: {
    timesTheAppHasBeenOpened: 0,
  },
})

export const getters = {
  getTimesTheAppHasBeenOpened(state) {
    return state.statistics.timesTheAppHasBeenOpened
  },
}

export const mutations = {
  setTimesTheAppHasBeenOpened(state, value) {
    state.statistics.timesTheAppHasBeenOpened = value
  },
}

export const actions = {
  async simpleFetch({ state, dispatch }, { url, options }) {
    const response = await this.$axios.get(url, options)

    return response
  },

  async simpleApiFetch({ state, dispatch }, { url, options }) {
    const AXIOS_OPTIONS = {
      headers: {
        Authorization: this.$auth.strategy.token.get(),
      },
    }

    return await dispatch('simpleFetch', {
      url,
      options: { ...options, ...AXIOS_OPTIONS },
    })
  },
}
