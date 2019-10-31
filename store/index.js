export const state = () => ({
  dashBoardData: {
    data: '', // Data that is rendered to the web app
    pid: 0 // Page id
  },
  searchData: {
    data: '', // Data received while searching for tags
    tags: [],
    isActive: false
  },
  generalData: {
    apiUrl: 'https://r34-json.herokuapp.com/', // Default api
    backupApiUrl: 'https://r34-api-clone.herokuapp.com/',
    postLimit: 20,
    errors: undefined
  }
})

export const mutations = {
  // Handler for post's data changes
  newDashBoardData(state, payload) {
    // Data
    if (payload.data !== undefined) {
      // console.log(payload.data);
      state.dashBoardData.data = payload.data
    }

    // Errors
    if (payload.errors !== undefined) {
      state.generalData.errors = payload.errors
    }

    // Page ID
    if (payload.pid !== undefined) {
      // console.log(payload.pid);
      state.dashBoardData.pid = payload.pid
    }
  },

  // Handler for api changes
  newApiUrl(state, payload) {
    // New url
    state.generalData.apiUrl = payload.newUrl
  },

  // Handler for Search changes

  newSearchData(state, payload) {
    // Apply "active" css class
    if (payload.isActive !== undefined) {
      state.searchData.isActive = payload.isActive
    }

    // Errors
    if (payload.errors !== undefined) {
      state.generalData.errors = payload.errors
    }
    // Data
    if (payload.data !== undefined) {
      // console.log(payload.data);
      state.searchData.data = payload.data
    }

    // Added tags
    if (payload.tag !== undefined) {
      // console.log(payload.tag.function);

      if (payload.tag.function === 'add') {
        // console.log(payload.tag.name);
        state.searchData.tags.push(payload.tag.name)
      }
      if (payload.tag.function === 'remove') {
        // console.log(payload.tag.name);
        state.searchData.tags = state.searchData.tags.filter(function(ele) {
          return ele !== payload.tag.name
        })
      }
    }
  }
}

export const actions = {
  // This a customisable Get request
  async axiosGet({ commit, dispatch }, dataObj) {
    // Reset errors cause we're trying again
    commit({
      type: dataObj.mutationToReturn,
      errors: undefined
    })

    // Debugging what url does it get
    // console.log(dataObj.url);

    // Actual axios get
    try {
      const response = await this.$axios.$get(
        this.state.generalData.apiUrl + dataObj.url
      )

      commit({
        type: dataObj.mutationToReturn,
        data: response.data
      })
      // console.log(response);
    } catch (error) {
      // console.error(error);
      commit({
        type: dataObj.mutationToReturn,
        errors: error
      })

      // Change to another Api
      dispatch('changeApi', {
        errors: error
      })
    }
  },

  // Change api to an alternative one
  async changeApi({ commit }) {
    if (this.state.generalData.apiUrl !== this.state.generalData.backupApiUrl) {
      //   console.log(`${dataObj.errors}, changing to alternative api`)

      await commit({
        type: 'newApiUrl',
        newUrl: 'https://r34-api-clone.herokuapp.com/'
      })
    }
  },

  // Change api to an alternative one
  async changePID({ commit }, dataObj) {
    if (dataObj.function === 'add') {
      await commit('newDashBoardData', {
        pid: parseInt(this.state.dashBoardData.pid) + 1
      })
    } else if (dataObj.function === 'subtract') {
      await commit('newDashBoardData', {
        pid: parseInt(this.state.dashBoardData.pid) - 1
      })
    } else if (dataObj.function === 'reset') {
      await commit('newDashBoardData', {
        pid: 0
      })
    }
  },

  // Toggles the search (This is the way i found it to work since i cannot get components to talk to each other and im not doing a bus if i have vueX)
  async toggleSearchComponent({ commit }) {
    if (this.state.searchData.isActive) {
      await commit({
        type: 'newSearchData',
        isActive: false
      })
    } else if (!this.state.searchData.isActive) {
      await commit({
        type: 'newSearchData',
        isActive: true
      })
    }
  },

  async getAddedTags({ dispatch }) {
    await dispatch('axiosGet', {
      url: `posts?pid=${this.state.dashBoardData.pid}&limit=${
        this.state.generalData.postLimit
      }&tags=${this.state.searchData.tags.join('+')}`,
      mutationToReturn: 'newDashBoardData'
    })
  }
}
