import Vue from 'vue';
import Vuex from 'vuex';
import axios from "axios";

// Are we debugging?
const debug = process.env.NODE_ENV !== 'production';

// Use Vuex
Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        dashBoardData: {
            data: "",
            errors: "",
            pid: 1, // Page id
        },
        searchData: {
            data: "",
            errors: "",
            query: "",
            isActive: false,
        },
        generalData: {
            limit: 20,
        },
        apiUrl: "https://r34-json.herokuapp.com/", // Default api
        searchApiUrl: "https://r34-json.herokuapp.com/", // Default api

    },

    // Necessary for debugging and keeping track of state variables
    mutations: {

        // Handler for post's data changes
        newDashBoardData(state, payload) {

            // Data
            if (payload.data !== undefined) {
                // console.log(payload.data);
                state.dashBoardData.data = payload.data;
            }

            // Errors
            state.dashBoardData.errors = payload.errors;

            // Page ID
            if (payload.pid !== undefined) {
                // console.log(payload.pid);
                state.dashBoardData.pid = payload.pid;
            }

        },

        // Handler for api changes
        newApiUrl(state, payload) {
            // New url
            state.apiUrl = payload.newUrl;
        },

        // Handler for Search changes
        newSearchData(state, payload) {

            // Apply "active" css class
            if (payload.isActive !== undefined) {
                state.searchData.isActive = payload.isActive;
            }

            // Errors
            state.searchData.errors = payload.errors;

            // Data
            if (payload.data !== undefined) {
                // console.log(payload.data);
                state.searchData.data = payload.data;
            }
        },
    },

    // Like mutations but asynchronous
    actions: {

        // This a customisable Get request
        async axiosGet({
            commit,
            dispatch
        }, dataObj) {

            // Reset errors cause we're trying again
            commit({
                type: dataObj.mutationToReturn,
                errors: ""
            });

            // Debugging what url does it get
            // console.log(dataObj.url);

            // Actual axios get
            try {
                const response = await axios.get(
                    this.state.apiUrl + dataObj.url
                );

                commit({
                    type: dataObj.mutationToReturn,
                    data: response.data
                });
                // console.log(response);
            } catch (error) {
                // console.error(error);
                commit({
                    type: dataObj.mutationToReturn,
                    errors: error
                });

                // Change to another Api
                dispatch("changeApi", {
                    errors: error
                });
            }
        },

        // Change api to an alternative one
        async changeApi({
            commit
        }, dataObj) {

            console.log(`${dataObj.errors}, changing to alternative api`);

            commit({
                type: "newApiUrl",
                newUrl: "https://r34-api-clone.herokuapp.com/"
            });
        },

        // Toggles the search (This is the way i found it to work since i cannot get components to talk to each other and im not doing a bus if i have vueX)
        async toggleSearchComponent({
            commit
        }, dataObj) {
            if (this.state.searchData.isActive) {
                commit({
                    type: "newSearchData",
                    isActive: false
                });
            } else if (!this.state.searchData.isActive) {
                commit({
                    type: "newSearchData",
                    isActive: true
                });
            }
        }
    },

    strict: debug
});