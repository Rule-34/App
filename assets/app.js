import {
    init,
    track,
    parameters
} from "insights-js";
import Vue from 'vue';
import store from './store/store.js'; // Import components
import SideNav from './js/components/SideNav';
import DashBoard from './js/components/DashBoard';
import VueLazyload from 'vue-lazyload'; // Import lazyloading
import vueDebounce from 'vue-debounce'; // Debouncing

/* -------- Vue plugins -------- */

// Lazy load images
Vue.use(VueLazyload, {
    lazyComponent: true,
    preLoad: 2,
    // error: 'dist/error.png',
    // loading: 'dist/loading.gif', // TODO: Add skeletonBox

    // optional
    observer: true,
    observerOptions: {
        rootMargin: '0px',
        threshold: 0.01
    }
});

// Vue debouncing
Vue.use(vueDebounce);

/* -------- Vue -------- */

new Vue({
    el: '#app',
    // provide the store using the "store" option.
    // this will inject the store instance to all child components.
    store,
    components: {
        SideNav,
        DashBoard
    }
});

/* -------- Analytics -------- */

const debug = process.env.NODE_ENV !== 'production';

if (!debug) {

    init("kQrGvntXWy9eDO4h");
    track({
        id: "user-usage",
        parameters: {
            path: parameters.path(),
            locale: parameters.locale(),
            screenType: parameters.screenType(),
            referrer: parameters.referrer(),
            duration: parameters.durationInterval(5000)
        }
    });
}