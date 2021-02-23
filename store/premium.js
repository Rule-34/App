export const getters = {
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
  async authenticate(context, { username, password }) {
    const { dispatch } = context

    try {
      //

      await this.$auth.loginWith('local', {
        data: {
          username: '_',
          password,
        },
      })

      //
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
