export default {
  /**
   * Handler for post's data changes
   * @param {*} state Default
   * @param {Object} parameters Settings in an object
   */
  dashBoardManager(state, parameters) {
    // Post data related
    if (parameters.data !== undefined) {
      switch (parameters.mode) {
        case 'add':
          state.dashBoardData.data = parameters.data
          break

        case 'concat':
          state.dashBoardData.data = state.dashBoardData.data.concat(
            parameters.data
          )
          break
      }
    }
  },

  /**
   * Modifies Page ID
   * @param {*} state Default
   * @param {Object} parameters .operation (specific, add, subtract, reset) and .value
   */
  pidManager(state, parameters) {
    switch (parameters.operation) {
      case 'specific':
        state.dashBoardData.pid = parameters.value
        break

      case 'add':
        state.dashBoardData.pid++
        break

      case 'subtract':
        state.dashBoardData.pid--
        break

      case 'reset':
        state.dashBoardData.pid = 0
        break
    }
  },

  /**
   * Handler for api changes
   * @param {*} state Default store
   * @param {String} domain New domain
   */
  domainManager(state, domain) {
    console.log(domain)
    // New url
    if (domain !== undefined) {
      state.dashBoardSettings.contentDomain = domain
    }
  },

  /**
   * Handler for Side Nav
   * @param {*} state Default store
   * @param {Object} parameters Operation to do (close, open, or nothing to toggle)
   */
  sideNavManager(state, operation) {
    switch (operation) {
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

  /**
   *
   * @param {*} state Default
   * @param {String} parameters Error string
   */
  generalManager(state, parameters) {
    // Errors
    if (parameters.errors !== undefined) {
      state.generalData.errors = parameters.errors
    }
  },

  /**
   *
   * @param {*} state Default
   * @param {Object} parameters .operation, .tag, .tag.name
   */
  tagManager(state, parameters) {
    if (parameters.operation !== undefined) {
      switch (parameters.operation) {
        // Add if it doesnt already exist
        case 'add':
          if (!state.searchData.tags.includes(parameters.tag.name)) {
            state.searchData.tags.push(parameters.tag.name)
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
            return ele !== parameters.tag.name
          })
          break

        case 'reset':
          state.searchData.tags = []
          break
      }
    }
  },

  /**
   * Handler for search data
   * @param {*} state Default
   * @param {Object} parameters Object with settings
   */
  searchManager(state, parameters) {
    // Toggle Search
    if (parameters.isActive !== undefined) {
      state.searchData.isActive = parameters.isActive
    }

    // Toggle Filter
    if (parameters.isFilterActive !== undefined) {
      state.searchData.isFilterActive = parameters.isFilterActive
    }

    // Change data
    if (parameters.data !== undefined) {
      // console.log(parameters.data);
      state.searchData.data = parameters.data
    }

    if (parameters.premadeFilterData !== undefined) {
      // console.log(parameters.premadeFilterData);
      state.searchData.premadeFilterData = parameters.premadeFilterData
    }
  },

  /**
   *
   * @param {*} state Default
   * @param {Object} parameters .operation, .data
   */
  notificationManager(state, parameters) {
    switch (parameters.operation) {
      // Set count to notification length
      case 'setCount':
        state.notificationData.count = state.notificationData.data.length
        break

      case 'setData':
        state.notificationData.data = parameters.data
        break
    }
  },

  /**
   * Changes user settings
   * @param {*} state Default
   * @param {Object} parameters Object with settings (.index = name, .value = Boolean)
   */
  userSettingsManager(state, parameters) {
    // Change value
    if (parameters !== undefined) {
      // console.log(parameters);
      state.userSettings[parameters.index].value = parameters.value
    }
  },

  experimentalManager(state, parameters) {
    switch (parameters) {
      case 'enable':
        state.dashBoardSettings.experimentalSettings = true
        break

      case 'disable':
        state.dashBoardSettings.experimentalSettings = false
        break

      // Toggle
      default:
        state.dashBoardSettings.experimentalSettings = !state.dashBoardSettings
          .experimentalSettings
        break
    }
  }
}
