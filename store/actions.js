export default {
  // This a customisable Get request
  async axiosGet({ commit, dispatch }, dataObj) {
    // Reset errors cause we're trying again
    commit({
      type: dataObj.mutationToReturn,
      errors: null
    });

    // Debugging what url does it get
    // console.log(dataObj.url)
    // console.log(dataObj.mutationToReturn)

    // Actual axios get
    try {
      const response = await this.$axios.$get(
        this.state.generalData.apiUrl + dataObj.url
      );

      commit({
        type: dataObj.mutationToReturn,
        data: response,
        mode: dataObj.mode
        // Sometimes its response sometimes its response.data
      });

      // Check when loading more posts if theres no more posts TODO: Did real bad, do again but better in the future
      try {
        if (!response.posts.length) {
          commit({
            type: dataObj.mutationToReturn,
            errors: "There are no more posts to load!"
          });
        }
      } catch {
        // console.log("Error");
      }
      // console.log(response)
    } catch (error) {
      // console.error(error);
      commit({
        type: dataObj.mutationToReturn,
        errors: error
      });

      // Change to another Api
      dispatch("apiManager", {
        errors: error
      });
    }
  },
  // Get posts from api
  async getPosts({ dispatch }, mode) {
    // console.log(`${this.dashBoardData.pid} GET`)
    // console.log(mode);
    await dispatch("axiosGet", {
      url: `posts?pid=${this.state.dashBoardData.pid}&limit=${
        this.state.generalData.postLimit
      }&tags=${this.state.searchData.tags.join("+")}+score:>=${
        this.state.userSettings.score.value
      }`,
      mutationToReturn: "newDashBoardData",
      // Add with the mode passed or with add so its retrocompatible
      mode: mode || "add"
    });
  },

  // Change api to an alternative one
  async apiManager({ commit }) {
    if (this.state.generalData.apiUrl !== this.state.generalData.backupApiUrl) {
      //   console.log(`${dataObj.errors}, changing to alternative api`)

      await commit({
        type: "newApiUrl",
        newUrl: "https://r34-api-clone.herokuapp.com/"
      });
    }
  },

  // Change api to an alternative one
  async pidManager({ commit }, dataObj) {
    if (dataObj.function === "add") {
      await commit("newDashBoardData", {
        pid: parseInt(this.state.dashBoardData.pid) + 1
      });
    } else if (dataObj.function === "subtract") {
      await commit("newDashBoardData", {
        pid: parseInt(this.state.dashBoardData.pid) - 1
      });
    } else if (dataObj.function === "reset") {
      await commit("newDashBoardData", {
        pid: 0
      });
    }
  },

  async tagManager({ commit }, dataObj) {
    // Reset tags
    if (dataObj.function === "reset") {
      // Reset tags
      await commit({
        type: "newSearchData",
        // We reset this way since its a tag function
        tag: {
          function: "reset"
        }
      });
      // And show search
      if (!this.state.searchData.isActive) {
        await commit({
          type: "newSearchData",
          isActive: !this.state.searchData.isActive
        });
      }
    }
  }
};
