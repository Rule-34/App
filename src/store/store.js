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
            errors: ""
        },
        searchData: {
            data: "",
            errors: ""
        },
        apiUrl: "https://r34-json.herokuapp.com/",

    },
    mutations: {
        newLatestPostsData(state, payload) {
            if (payload.data) {
                state.latestPostsData.data = payload.data;
            }
            // if (payload.errors) {
            state.latestPostsData.errors = payload.errors;
            // }

        },
        newApiUrl(state, payload) {
            state.apiUrl = payload.newUrl;
        },
    },
    actions: {

        // This an Ajax Get
        async axiosGet({
            commit,
            dispatch
        }, dataObj) {
            // Reset errors cause we're trying again
            commit({
                type: dataObj.mutationToReturn,
                errors: ""
            });

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

        async changeApi({
            commit
        }, dataObj) {

            console.log(`${dataObj.errors}, changing to alternative api`);

            commit({
                type: "newApiUrl",
                newUrl: "https://r34-api-clone.herokuapp.com/"
            });
        }
    },

    strict: debug
});