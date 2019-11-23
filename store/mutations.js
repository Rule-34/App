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
        case "add":
          state.dashBoardData.data = payload.data;
          break;

        case "concat":
          state.dashBoardData.data.posts = state.dashBoardData.data.posts.concat(
            payload.data.posts
          );
          break;
      }
    }

    // Errors
    if (payload.errors !== undefined) {
      state.generalData.errors = payload.errors;
    }

    // Page ID
    if (payload.pid !== undefined) {
      state.dashBoardData.pid = payload.pid;
    }
  },

  // Handler for api changes
  newApiUrl(state, payload) {
    // New url
    state.generalData.apiUrl = payload.newUrl;
  },

  /**
   *
   * SEARCH BAR related
   *
   **/

  // Handler for Search changes
  newSearchData(state, payload) {
    // Apply "active" css class
    if (payload.isActive !== undefined) {
      state.searchData.isActive = payload.isActive;
    }

    if (payload.isFilterActive !== undefined) {
      state.searchData.isFilterActive = payload.isFilterActive;
    }

    // Errors
    if (payload.errors !== undefined) {
      state.generalData.errors = payload.errors;
    }
    // Data
    if (payload.data !== undefined) {
      // console.log(payload.data);
      state.searchData.data = payload.data;
    }

    // Added tags
    if (payload.tag !== undefined) {
      // console.log(payload.tag.operation);

      switch (payload.tag.operation) {
        // Add if it doesnt already exist
        case "add":
          if (!state.searchData.tags.includes(payload.tag.name)) {
            state.searchData.tags.push(payload.tag.name);
          }
          break;

        // Instead of adding one, add multiple with concat
        case "concat":
          state.searchData.tags = state.searchData.tags.concat(
            payload.tag.name
          );
          break;

        case "remove":
          state.searchData.tags = state.searchData.tags.filter(function(ele) {
            return ele !== payload.tag.name;
          });
          break;

        case "reset":
          state.searchData.tags = [];
          break;
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
      state.userSettings[payload.index].value = payload.value;
    }
  }
};
