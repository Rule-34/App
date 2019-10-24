import Vue from 'vue'; // Import components
import axios from 'axios'; // Import components
import Header from './js/components/Header';
import SideNav from './js/components/SideNav';
import LatestPosts from './js/components/LatestPosts';
import Footer from './js/components/Footer';


new Vue({
    el: '#app',
    components: {
        Header,
        SideNav,
        LatestPosts,
        Footer
    }
});