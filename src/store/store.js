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

    },
    mutations: {
        newLatestPostsData(state, payload) {
            if (payload.data) {
                state.latestPostsData.data = payload.data;
            }
            // if (payload.errors) {
            state.latestPostsData.errors = payload.errors;
            // }

        }
    },

    actions: {
        async getLatestPostsData(context) {
            // Reset errors cause we're trying again
            context.commit({
                type: "newLatestPostsData",
                errors: ""
            });

            try {
                const response = await axios.get(
                    "https://r34-json.herokuapp.com/posts"
                );

                context.commit({
                    type: "newLatestPostsData",
                    data: response.data
                });
                // console.log(response);
            } catch (error) {
                // console.error(error);
                context.commit({
                    type: "newLatestPostsData",
                    errors: error
                });
            }
        }
    },

    strict: debug
});