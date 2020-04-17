import fireAnalytics from '~/assets/js/analytics' // Import analytics

export default {
  /**
   * Fetches data by mode
   * @param {*} param0
   * @param {Object} parameters (.url) Url to get data from | (.mutationToReturn) Mutation to return data to | (.domain) Domain to get the data from
   */
  async fetchWithMode({ dispatch, commit, state }, parameters) {
    /* --- Initialize variables --- */

    // For every execution
    let response
    // For execution api
    let domain = state.dashBoardSettings.contentDomain
    // For post data
    const pid = state.dashBoardData.pid
    const limit = state.userSettings.postsPerPage.value
    const tags = state.searchData.tags.join('+')
    const score = state.userSettings.score.value
    // For NSFW checking
    const nsfw = state.userSettings.nsfw.value
    // Cors Proxy usage?
    const corsProxy = '&corsProxy=true'

    // Reset errors
    if (state.generalData.errors) {
      commit({
        type: 'generalManager',
        errors: null,
      })
    }

    // Load safebooru if NSFW is disabled
    if (!nsfw) {
      if (domain !== 'safebooru') {
        // console.log('Loading safebooru')

        commit('domainManager', 'safebooru')
        commit('tagManager', { operation: 'reset' })
        commit('pidManager', { operation: 'reset' })

        domain = 'safebooru'
      }
    }

    // Populate domain
    // if (parameters.domain) {
    //   domain = parameters.domain
    // }

    console.debug(domain)

    // Choose mode
    switch (parameters.mode) {
      case 'basic':
        // Fetch data
        response = await dispatch('simpleFetch', { url: parameters.url })
        break

      case 'posts':
        // Craft URL
        parameters.url =
          'posts?pid=' +
          pid +
          '&limit=' +
          limit +
          '&tags=' +
          tags +
          '&score=' +
          score +
          corsProxy

        // Fetch data
        response = await dispatch('simpleFetch', {
          url: state.generalData.apiUrl + domain + '/' + parameters.url,
        })

        // Set mutation to return
        parameters.mutationToReturn = 'dashBoardManager'
        break

      case 'single-post':
        // Craft URL
        parameters.url = 'single-post?id=' + parameters.postId + corsProxy

        // Fetch data
        response = await dispatch('simpleFetch', {
          url: state.generalData.apiUrl + domain + '/' + parameters.url,
        })

        // Set mutation to return
        parameters.mutationToReturn = 'dashBoardManager'
        parameters.returnMode = 'add'
        break

      case 'tags':
        // Craft URL
        parameters.url = '?tag=' + parameters.tag + '&limit=' + limit

        // Fetch data
        response = await dispatch('simpleFetch', {
          url: state.generalData.apiUrl + domain + '/tags' + parameters.url,
        })

        // Set mutation to return
        parameters.mutationToReturn = 'searchManager'
        parameters.returnMode = 'changeData'

        break

      case 'notifications':
        // Fetch data
        response = await dispatch('simpleFetch', {
          url:
            'https://cdn.statically.io/gist/VoidlessSeven7/2fe43e0eee40be63d9b2a582b2793cf9/raw/app-notifications.json',
        })

        // Set mutation to return
        parameters.mutationToReturn = 'notificationManager'
        parameters.returnMode = 'setData'

        break

      case 'filter':
        // Fetch data
        response = await dispatch('simpleFetch', {
          url:
            'https://cdn.statically.io/gist/VoidlessSeven7/2fe43e0eee40be63d9b2a582b2793cf9/raw/app-furry-filter.min.json',
        })

        // Set mutation to return
        parameters.mutationToReturn = 'searchManager'
        parameters.returnMode = 'changeFilterData'

        break

      default:
        throw new Error('No mode specified')
    }

    // If we want to pass back data we return
    if (parameters.mutationToReturn === 'return') {
      return response
    }

    // Add the successful response to the state
    commit({
      type: parameters.mutationToReturn,
      data: response,
      mode: parameters.returnMode,
    })

    // Fire analytics
    // switch (parameters.mode) {
    //   case 'posts':
    //   case 'single-post':
    //     await dispatch('analyticManager', 'domain')
    //     break

    //   case 'tags':
    //     await dispatch('analyticManager', 'tags')
    //     break
    // }
  },

  /**
   * Simple fetch that returns error to vue store
   * @param {*} param0
   * @param {String} url URL to fetch
   */
  async simpleFetch({ commit }, { url, options }) {
    const data = await fetch(url, options)
      // Save the data
      .then((response) => response.json())

      // Catch errors and commit to generalManager
      .catch((error) => {
        commit({
          type: 'generalManager',
          errors: error,
        })
      })

    return data
  },

  async analyticManager({ state }, execution) {
    switch (execution) {
      // Send tags
      case 'tags':
        await fireAnalytics(
          'tags',
          state.searchData.tags,
          state.searchData.premadeFilterData
        ).then(console.debug)
        break

      // Send domain
      case 'domain':
        await fireAnalytics(
          'domain',
          state.dashBoardSettings.contentDomain
        ).then(console.debug)
        break

      // Send user settings
      case 'settings':
        await fireAnalytics('settings', state.userSettings).then(console.debug)
        break
    }
  },
}
