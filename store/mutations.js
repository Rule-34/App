export default {
  /**
   *
   * DASHBOARD related
   *
   **/

  // Handler for post's data changes
  newDashBoardData(state, payload) {
    // Data related
    if (payload.data !== undefined) {
      switch (payload.mode) {
        case 'add':
          state.dashBoardData.data = payload.data
          break

        case 'concat':
          state.dashBoardData.data.posts = state.dashBoardData.data.posts.concat(
            payload.data.posts
          )
          break
      }
    }

    // Errors
    if (payload.errors !== undefined) {
      state.generalData.errors = payload.errors
    }

    // Page ID
    if (payload.pid !== undefined) {
      state.dashBoardData.pid = payload.pid
    }
  },

  // Handler for api changes
  apiManager(state, domain) {
    console.log(domain)
    // New url
    if (domain !== undefined) {
      state.dashBoardSettings.contentDomain = domain
    }
  },

  /**
   *
   * Side Nav related
   *
   **/

  sideNavManager(state, payload) {
    switch (payload) {
      case 'close':
        state.sideNavData.isActive = false
        break

      case 'open':
        state.sideNavData.isActive = true
        break

      default:
        // Toggle
        state.sideNavData.isActive = !state.sideNavData.isActive
        break
    }
  },

  newGeneralData(state, payload) {
    // Errors
    if (payload.errors !== undefined) {
      state.generalData.errors = payload.errors
    }
  },

  /**
   *
   * SEARCH BAR related
   *
   **/

  // Handler for Search changes
  newSearchData(state, payload) {
    // Toggle Search
    if (payload.isActive !== undefined) {
      state.searchData.isActive = payload.isActive
    }

    // Toggle Filter
    if (payload.isFilterActive !== undefined) {
      state.searchData.isFilterActive = payload.isFilterActive
    }

    // Change data
    if (payload.data !== undefined) {
      // console.log(payload.data);
      state.searchData.data = payload.data
    }

    if (payload.premadeFilterData !== undefined) {
      // console.log(payload.premadeFilterData);
      state.searchData.premadeFilterData = payload.premadeFilterData
    }

    // Added tags
    if (payload.tag !== undefined) {
      // console.log(payload.tag.operation);

      switch (payload.tag.operation) {
        // Add if it doesnt already exist
        case 'add':
          if (!state.searchData.tags.includes(payload.tag.name)) {
            state.searchData.tags.push(payload.tag.name)
          }
          break

        // Instead of adding one, add multiple with concat
        case 'concat':
          state.searchData.tags = state.searchData.tags.concat(
            state.searchData.premadeFilterData
          )
          break

        case 'remove':
          state.searchData.tags = state.searchData.tags.filter(function(ele) {
            return ele !== payload.tag.name
          })
          break

        case 'reset':
          state.searchData.tags = []
          break
      }
    }
  },

  /**
   *
   * SETTINGS related
   *
   **/

  changeUserSetting(state, payload) {
    // Change value
    if (payload !== undefined) {
      // console.log(payload);
      state.userSettings[payload.index].value = payload.value
    }
  },
}
