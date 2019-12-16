import fireAnalytics from '~/assets/js/insights.custom' // Import analytics

export default {
  // This a customisable Get request
  async httpsGet({ commit, dispatch }, dataObj) {
    // Debugging what url does it get
    // console.log(dataObj.url)
    // console.log(dataObj.mutationToReturn)

    // Reset errors cause we're trying again
    commit({
      type: dataObj.mutationToReturn,
      errors: null,
    })

    // Get the domain from localStorage if it exists otherwise use vuex store
    let domainUrl
    try {
      domainUrl = JSON.parse(localStorage.getItem('vuex')).dashBoardSettings
        .contentDomain
    } catch {
      console.log('No localStorage key found, using vuex store default')
      domainUrl = this.state.dashBoardSettings.contentDomain
    }

    // Actual http get
    try {
      const response = await fetch(
        this.state.generalData.apiUrl + domainUrl + dataObj.url
      ).then(response => response.json())
      // console.log(response)

      commit({
        type: dataObj.mutationToReturn,
        data: response,
        mode: dataObj.mode,
        // Sometimes its response sometimes its response.data
      })
    } catch (error) {
      commit({
        type: 'generalManager',
        errors: error,
      })
    }
  },
  // Get posts from api
  async getPosts({ dispatch }, mode) {
    // console.log(mode);
    await dispatch('httpsGet', {
      url: `posts?pid=${this.state.dashBoardData.pid}&limit=${
        this.state.generalData.postLimit
      }&tags=${this.state.searchData.tags.join('+')}&score=${
        this.state.userSettings.score.value
      }`,
      mutationToReturn: 'dashBoardManager',
      // Add with the mode passed or with add so its retrocompatible
      mode: mode || 'add',
    })
  },

  // Get specific url through API's cors proxy
  async getApi({ commit }, dataObj) {
    // console.log(url);
    try {
      // Get url through proxy
      const result = await fetch(
        `${this.state.generalData.apiUrl}proxy?url=${dataObj.url}`
      ).then(response => response.json())

      if (dataObj.mode === 'filter') {
        // console.log(result)
        commit({
          type: 'searchManager',
          premadeFilterData: result,
        })

        // Since we're sending to vuex store, return nothing
        return
      }
      // And return value to calling function
      return result

      // If theres errors
    } catch (error) {
      commit({
        type: 'generalManager',
        errors: error,
      })
    }
  },
  // eslint-disable-next-line no-unused-vars
  async analyticManager({ commit }, execution) {
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
