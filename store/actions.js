import fireAnalytics from '~/assets/js/insights.custom' // Import analytics

export default {
  /**
   * Gets any route from the API after the domain, commonly used for tags and posts
   * @param {*} param0
   * @param {Object} parameters
   */
  async getApi({ commit, state }, parameters) {
    // Reset errors cause we're trying again
    if (state.generalData.errors) {
      commit({
        type: 'generalManager',
        errors: null,
      })
    }

    // Get domain from localStorage or from state if it fails
    let domain
    try {
      domain = JSON.parse(localStorage.getItem('vuex')).dashBoardSettings
        .contentDomain

      // If its impossible to get it from localStorage then set it to the default store domain
    } catch {
      console.log('No localStorage key found, using vuex store default')
      domain = state.dashBoardSettings.contentDomain
    }

    // Craft url and GET it through fetch
    const response = await fetch(
      state.generalData.apiUrl + domain + '/' + parameters.url
    )
      // Save the data
      .then(response => response.json())
      // Catch an error
      .catch(error => {
        console.error(error)
        commit({
          type: 'generalManager',
          errors: error,
        })
      })

    // console.log(response)
    // console.log(parameters.mode)

    // In case it wants the response itself
    if (parameters.mutationToReturn === 'return') {
      return response
    }

    // Add the successful response to the state
    commit({
      type: parameters.mutationToReturn,
      data: response,
      mode: parameters.mode,
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
      state.generalData.postLimit +
      '&tags=' +
      state.searchData.tags.join('+') +
      '&score=' +
      state.userSettings.score.value

    // Craft url and GET it through fetch action
    await dispatch('getApi', {
      url,
      mutationToReturn: 'dashBoardManager',
      mode,
    })
  },

  /**
   * Gets Posts from API and adds them to the state
   * @param {*} param0
   * @param {String} mode Add or Concat
   */
  async getSinglePost({ dispatch }, id) {
    const url = 'posts?id=' + id

    // Craft url and GET it through fetch action
    const response = await dispatch('getApi', {
      url,
      mutationToReturn: 'dashBoardManager',
      mode: 'add',
    })

    // Return it
    return response
  },

  /**
   * Searches tags related to the tag parameter from the API and adds them to the state
   * @param {*} param0
   * @param {String} tag Tag to search for in the API
   */
  async searchTag({ dispatch, state }, tag) {
    const url = 'tags?tag=' + tag + '&limit=' + state.generalData.postLimit

    // Craft url and GET it through fetch action
    await dispatch('getApi', {
      url,
      mutationToReturn: 'searchManager',
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
      state.generalData.apiUrl + 'proxy?url=' + parameters.url
    )
      // Save the data
      .then(response => response.json())
      // Catch an error
      .catch(error => {
        console.error(error)
        commit({
          type: 'generalManager',
          errors: error,
        })
      })

    // console.log(response)

    if (parameters.mode === 'filterData') {
      commit({
        type: 'searchManager',
        premadeFilterData: response,
      })

      // Since we're sending to vuex store, return nothing
      return
    }

    // If called directly with no mode then just return it
    return response
  },

  async analyticManager(execution) {
    // console.log(execution)

    switch (execution) {
      // Send tags and filter data
      case 'tags':
        await fireAnalytics(
          'tags',
          this.state.searchData.tags,
          this.state.searchData.premadeFilterData
        ).then(console.log)
        break

      // Send new domain
      case 'domain':
        await fireAnalytics(
          'domain',
          this.state.dashBoardSettings.contentDomain
        ).then(console.log)
        break

      // Send user settings
      case 'settings':
        await fireAnalytics('settings', this.state.userSettings).then(
          console.log
        )
        break
    }
  },
}
