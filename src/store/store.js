import Vue from 'vue';
import Vuex from 'vuex';
import axios from "axios";

// Are we debugging?
const debug = process.env.NODE_ENV !== 'production';

// Use Vuex
Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        latestPostsData: {
            data: "",
            errors: "",
            pid: 1, // Page id
        },
        searchData: {
            data: "",
            errors: "",
            isActive: false,
        },
        apiUrl: "https://r34-json.herokuapp.com/", // Default api

    },
    mutations: {
        // Handler for post's data changes
        newLatestPostsData(state, payload) {
            if (payload.data !== undefined) {
                // console.log(payload.data);
                state.latestPostsData.data = payload.data;
            }
            state.latestPostsData.errors = payload.errors;

            if (payload.pid !== undefined) {
                // console.log(payload.pid);
                state.latestPostsData.pid = payload.pid;
            }

        },
        // Handler for api changes
        newApiUrl(state, payload) {
            state.apiUrl = payload.newUrl;
        },
        newSearchData(state, payload) {
            state.searchData.isActive = payload.isActive;
        },
    },
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