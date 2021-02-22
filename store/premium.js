export const state = () => ({
  gumroad: {
    product: {
      license_key: undefined,
    },
  },
})

export const getters = {
  // hasValidLicenseKey

  getLicenseKey(state, getters, rootState, rootGetters) {
    return state.gumroad.product.license_key
  },

  isUserPremium(state, getters, rootState, rootGetters) {
    return rootState.authentication.user?.is_subscription_valid
  },

  getUserEmail(state, getters, rootState, rootGetters) {
    return rootState.authentication.user?.email
  },
}

export const mutations = {
  setLicenseKey(state, value) {
    state.gumroad.product.license_key = value
  },
}

export const actions = {
  async authenticate(context) {
    const { dispatch, getters } = context

    try {
      await this.$auth.loginWith('local', {
        data: {
          username: '_',
          password: getters.getLicenseKey,
        },
      })
    } catch (error) {
      dispatch(
        'errorManager',
        {
          operation: 'set',
          value: error,
          message: 'Could not authenticate.',
        },
        { root: true }
      )
    }
  },
}
