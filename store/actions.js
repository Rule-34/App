import fireAnalytics from '~/assets/js/insights.custom' // Import analytics

export default {
  // This a customisable Get request
  async axiosGet({ commit, dispatch }, dataObj) {
    // Reset errors cause we're trying again
    commit({
      type: dataObj.mutationToReturn,
      errors: null,
    })

    // Debugging what url does it get
    // console.log(dataObj.url)
    // console.log(dataObj.mutationToReturn)

    // Actual axios get
    try {
      const response = await this.$axios.$get(
        this.state.generalData.apiUrl +
          this.state.generalData.contentDomain +
          dataObj.url
      )

      commit({
        type: dataObj.mutationToReturn,
        data: response,
        mode: dataObj.mode,
        // Sometimes its response sometimes its response.data
      })

      // Check when loading more posts if theres no more posts TODO: Did real bad, do again but better in the future
      try {
        if (!response.posts.length) {
          commit({
            type: dataObj.mutationToReturn,
            errors: 'There are no more posts to load!',
          })
        }
      } catch {
        // console.log("Error");
      }
      // console.log(response)
    } catch (error) {
      // console.error(error);
      commit({
        type: dataObj.mutationToReturn,
        errors: error,
      })

      // Change to another Api
      dispatch('apiManager', {
        errors: error,
      })
    }
  },
  // Get posts from api
  async getPosts({ dispatch }, mode) {
    // console.log(mode);
    await dispatch('axiosGet', {
      url: `posts?pid=${this.state.dashBoardData.pid}&limit=${
        this.state.generalData.postLimit
      }&tags=${this.state.searchData.tags.join('+')}&score=${
        this.state.userSettings.score.value
      }`,
      mutationToReturn: 'newDashBoardData',
      // Add with the mode passed or with add so its retrocompatible
      mode: mode || 'add',
    })
  },

  // Get specific url through API's cors proxy
  async getApi({ dispatch }, url) {
    // console.log(url);
    const result = await this.$axios.$get(
      `${this.state.generalData.apiUrl}images?url=${url}`
    )
    return result
  },

  // Change api to an alternative one
  async apiManager({ commit }) {
    if (this.state.generalData.apiUrl !== this.state.generalData.backupApiUrl) {
      await console.log('changing to alternative api') // TODO: Do something with this

      // await commit({
      //   type: 'apiManager',
      //   newUrl: 'https://r34-api-clone.herokuapp.com/',
      // })
    } else {
      console.warn('The backup API is already being used')
    }
  },

  // Change api to an alternative one
  async pidManager({ commit }, dataObj) {
    switch (dataObj.operation) {
      case 'add':
        await commit('newDashBoardData', {
          pid: parseInt(this.state.dashBoardData.pid) + 1,
        })
        break

      case 'subtract':
        await commit('newDashBoardData', {
          pid: parseInt(this.state.dashBoardData.pid) - 1,
        })
        break

      case 'reset':
        await commit('newDashBoardData', {
          pid: 0,
        })
        break
    }
  },

  async tagManager({ commit }, dataObj) {
    // Reset tags
    if (dataObj.operation === 'reset') {
      // Reset tags
      await commit({
        type: 'newSearchData',
        // We reset this way since its a tag function
        tag: {
          operation: 'reset',
        },
      })
      // And show search
      if (!this.state.searchData.isActive) {
        await commit({
          type: 'newSearchData',
          isActive: !this.state.searchData.isActive,
        })
      }
    }
  },
  // eslint-disable-next-line no-unused-vars
  async analyticManager({ commit }, execution) {
    // console.log(execution)
    switch (execution) {
      case 'tags':
        await fireAnalytics('tags', this.state.searchData.tags).then(
          console.log
        )
        break

      case 'settings':
        await fireAnalytics('settings', this.state.userSettings).then(
          console.log
        )
        break
    }
  },
}
