import fireAnalytics from '~/assets/js/analytics' // Import analytics

export default {
  /**
   * Gets any route from the API after the domain, commonly used for tags and posts
   * @param {*} param0
   * @param {Object} parameters (.url) Url to get data from | (.mutationToReturn) Mutation to return data to | (.domain) Domain to get the data from
   */
  async getApi({ commit, state }, parameters) {
    // Reset errors cause we're trying again
    if (state.generalData.errors) {
      commit({
        type: 'generalManager',
        errors: null
      })
    }

    // Initialize variable
    let domain

    // Skip vuex and localStorage if domain is specified
    if (parameters.domain) {
      domain = parameters.domain

      // If no domain is specified then try to retrieve from localStorage or get it from the default Vuex state
    } else {
      // Get domain from localStorage or from state if it fails
      try {
        domain = JSON.parse(localStorage.getItem('vuex')).dashBoardSettings
          .contentDomain

        // If its impossible to get it from localStorage then set it to the default store domain
      } catch {
        console.log('No localStorage key found, using vuex store default')
        domain = state.dashBoardSettings.contentDomain
      }
    }
    // console.log('getApi domain: ', domain)

    // Craft url and GET it through fetch
    const response = await fetch(
      state.generalData.apiUrl + domain + '/' + parameters.url
    )
      // Save the data
      .then((response) => response.json())
      // Catch an error
      .catch((error) => {
        console.error(error)
        commit({
          type: 'generalManager',
          errors: error
        })
      })

    // console.log(response)
    // console.log(parameters.mode)

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
    const url =
      'posts?pid=' +
      state.dashBoardData.pid +
      '&limit=' +
      state.userSettings.postsPerPage.value +
      '&tags=' +
      state.searchData.tags.join('+') +
      '&score=' +
      state.userSettings.score.value

    // Craft url and GET it through fetch action
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
      // Catch an error
      .catch((error) => {
        console.error(error)
        commit({
          type: 'generalManager',
          errors: error
        })
      })

    // console.log(response)

    if (parameters.mode === 'filterData') {
      commit({
        type: 'searchManager',
        premadeFilterData: response
      })

      // Since we're sending to vuex store, return nothing
      return
    }

    // If called directly with no mode then just return it
    return response
  },

  async analyticManager({ state }, execution) {
    // console.log(execution)
    switch (execution) {
      // Send tags and filter data
      case 'tags':
        await fireAnalytics(
          'tags',
          state.searchData.tags,
          state.searchData.premadeFilterData
        ).then(console.log)
        break

      // Send new domain
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
