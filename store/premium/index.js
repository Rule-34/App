export const state = () => ({
  gumroad: {
    authAPI: {
      url: 'https://auth.r34.app/',

      fetchOptions: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: undefined, // Must be set by a getter
      },
    },

    product: {
      product_permalink: 'gRuqQm',
      license_key: undefined,
    },
  },

  responseData: undefined,
})

export const getters = {
  hasValidLicenseKey(state) {
    return state.responseData && state.responseData.success === true
  },

  isUserPremium(state) {
    return (
      state.responseData &&
      state.responseData.success === true &&
      state.responseData.purchase.disputed === false &&
      state.responseData.purchase.refunded === false &&
      state.responseData.purchase.subscription_cancelled_at === null &&
      state.responseData.purchase.subscription_failed_at === null
    )
  },

  getUserEmail(state) {
    return state.responseData && state.responseData.success
      ? state.responseData.purchase.email
      : undefined
  },

  getFetchOptionsInit(state) {
    return {
      ...state.gumroad.authAPI.fetchOptions,

      body: JSON.stringify(state.gumroad.product),
    }
  },
}

export const mutations = {
  setRawResponse(state, response) {
    state.responseData = response
  },

  removeRawResponse(state) {
    state.responseData = undefined
  },

  setLicenseKey(state, licenseKey) {
    state.gumroad.product.license_key = licenseKey
  },

  removeLicenseKey(state) {
    state.gumroad.product.license_key = undefined
  },
}

export const actions = {
  async authenticate({ state, dispatch, commit, getters }) {
    const response = await dispatch(
      'simpleFetch',
      {
        url: state.gumroad.authAPI.url,
        options: getters.getFetchOptionsInit,
      },
      { root: true } // Necessary for talking to root actions
    )

    // console.log(response)
    commit('setRawResponse', response)
  },
}
