import {
    init,
    track,
    parameters
} from "insights-js";
import Vue from 'vue';
import store from './store/store.js'; // Import components
import SideNav from './js/components/SideNav';
import LatestPosts from './js/components/LatestPosts';
import VueLazyload from 'vue-lazyload'; // Import lazyloading



// Lazy load images
Vue.use(VueLazyload, {
    lazyComponent: true,
    preLoad: 1.5,
    // error: 'dist/error.png',
    // loading: 'dist/loading.gif', // Add skeletonBox
    attempt: 2,
    observer: true,

    // optional
    observerOptions: {
        rootMargin: '0px',
        threshold: 0.1
    }
});

new Vue({
    el: '#app',
    // provide the store using the "store" option.
    // this will inject the store instance to all child components.
    store,
    components: {
        SideNav,
        LatestPosts
    }
});

// Analytics
init("kQrGvntXWy9eDO4h");
track({
    id: "user-usage",
    parameters: {
        locale: parameters.locale(),
        screenType: parameters.screenType(),
        referrer: parameters.referrer(),
        duration: parameters.durationInterval(5000)
    }
});