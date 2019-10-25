import {
    init,
    track,
    parameters
} from "insights-js";
import Vue from 'vue'; // Import components
import CoolBar from './js/components/CoolBar';
import SideNav from './js/components/SideNav';
import LatestPosts from './js/components/LatestPosts';
import Footer from './js/components/Footer';
import VueLazyload from 'vue-lazyload';

// Lazy load images
Vue.use(VueLazyload, {
    // set observer to true
    observer: true,

    // optional
    observerOptions: {
        rootMargin: '0px',
        threshold: 0.1
    }
});

new Vue({
    el: '#app',
    components: {
        CoolBar,
        SideNav,
        LatestPosts,
        Footer
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