export default {
  // Handler for post's data changes
  newDashBoardData(state, payload) {
    // console.log(payload);
    // Data
    if (payload.data !== undefined) {
      // console.log(payload.data)
      state.dashBoardData.data = payload.data;
    }

    // Errors
    if (payload.errors !== undefined) {
      state.generalData.errors = payload.errors;
    }

    // Page ID
    if (payload.pid !== undefined) {
      // console.log(payload.pid);
      state.dashBoardData.pid = payload.pid;
    }
  },

  // Handler for api changes
  newApiUrl(state, payload) {
    // New url
    state.generalData.apiUrl = payload.newUrl;
  },

  // Handler for Search changes

  newSearchData(state, payload) {
    // Apply "active" css class
    if (payload.isActive !== undefined) {
      state.searchData.isActive = payload.isActive;
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
      // console.log(payload.tag.function);

      if (payload.tag.function === "add") {
        // console.log(payload.tag.name);
        state.searchData.tags.push(payload.tag.name);
      }
      if (payload.tag.function === "remove") {
        // console.log(payload.tag.name);
        state.searchData.tags = state.searchData.tags.filter(function(ele) {
          return ele !== payload.tag.name;
        });
      }
    }
  }
};
