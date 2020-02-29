import fireAnalytics from '~/assets/js/analytics' // Import analytics

export default {
  /**
   * Gets any route from the API after the domain, commonly used for tags and posts
   * @param {*} param0
   * @param {Object} parameters (.url) Url to get data from | (.mutationToReturn) Mutation to return data to | (.domain) Domain to get the data from
   */
  async getApi({ commit, state }, parameters) {
    // Initialize variable
    let domain

    // Reset errors cause we're trying again
    if (state.generalData.errors) {
      commit({
        type: 'generalManager',
        errors: null
      })
    }

    // Skip vuex and localStorage if domain is specified
    if (parameters.domain) {
      domain = parameters.domain

      // If no domain is specified then try to retrieve from localStorage or from state if it fails
    } else {
      let localData

      try {
        localData = JSON.parse(localStorage.getItem('vuex'))

        domain = localData.dashBoardSettings.contentDomain
      } catch {
        console.log('getApi: No localStorage key found, using vuex store')

        domain = state.dashBoardSettings.contentDomain
      }
    }

    // Craft url and fetch it
    const response = await fetch(
      state.generalData.apiUrl + domain + '/' + parameters.url
    )
      // Save the data
      .then((response) => response.json())

      // Catch errors
      .catch((error) => {
        // console.error(error)
        commit({
          type: 'generalManager',
          errors: error
        })
      })

    // Add the successful response to the state
    commit({
      type: parameters.mutationToReturn,
      data: response,
      mode: parameters.mode
    })
  },

  /**
   * Gets Posts from API and adds them to the state
   * @param {*} param0
   * @param {String} mode Add or Concat
   */
  async getPosts({ dispatch, state }, mode) {
    const pid = state.dashBoardData.pid
    const tags = state.searchData.tags.join('+')
    let limit, score, localData

    // Retrieve data from localStorage or Vuex state as fallback
    try {
      localData = JSON.parse(localStorage.getItem('vuex'))

      limit = localData.userSettings.postsPerPage.value
      score = localData.userSettings.score.value
    } catch {
      console.log('getPosts: No localStorage key found, using vuex store')
      limit = state.userSettings.postsPerPage.value
      score = state.userSettings.score.value
    }

    const url =
      'posts?pid=' +
      pid +
      '&limit=' +
      limit +
      '&tags=' +
      tags +
      '&score=' +
      score

    // dispatch fetch function with crafted url
    await dispatch('getApi', {
      url,
      mutationToReturn: 'dashBoardManager',
      mode
    })
  },

  /**
   * Gets Posts from API and adds them to the state
   * @param {*} param0
   * @param {String} mode Add or Concat
   */
  async getSinglePost({ dispatch }, parameters) {
    const url = 'single-post?id=' + parameters.id

    // Craft url and GET it through fetch action
    await dispatch('getApi', {
      url,
      mutationToReturn: 'dashBoardManager',
      mode: 'add',
      domain: parameters.domain
    })
  },

  /**
   * Searches tags related to the tag parameter from the API and adds them to the state
   * @param {*} param0
   * @param {String} tag Tag to search for in the API
   */
  async searchTag({ dispatch, state }, tag) {
    const url =
      'tags?tag=' + tag + '&limit=' + state.userSettings.postsPerPage.value

    // Craft url and GET it through fetch action
    await dispatch('getApi', {
      url,
      mutationToReturn: 'searchManager'
    })
  },

  /**
   * Get specific url through API's cors proxy
   * @param {*} param0
   * @param {Object} parameters .url to download and .mode (Add to filter or none)
   */
  async getCorsProxy({ commit, state }, parameters) {
    // Craft url and GET it through fetch
    const response = await fetch(
      state.generalData.corsProxyUrl + '?q=' + parameters.url
    )
      // Save the data
      .then((response) => response.json())

      // Catch errors
      .catch((error) => {
        console.error(error)
        commit({
          type: 'generalManager',
          errors: error
        })
      })

    // console.log(response)

    // If return is assigned
    if (parameters.returnTo) {
      commit({
        type: parameters.returnTo,
        operation: parameters.operation,
        [parameters.returnData]: response
      })

      // Since we're sending to vuex store, return nothing
      return
    }

    // If called directly with no mode then just return it
    return response
  },

  async analyticManager({ state }, execution) {
    switch (execution) {
      // Send tags
      case 'tags':
        await fireAnalytics(
          'tags',
          state.searchData.tags,
          state.searchData.premadeFilterData
        ).then(console.log)
        break

      // Send domain
      case 'domain':
        await fireAnalytics(
          'domain',
          state.dashBoardSettings.contentDomain
        ).then(console.log)
        break

      // Send user settings
      case 'settings':
        await fireAnalytics('settings', state.userSettings).then(console.log)
        break
    }
  }
}
