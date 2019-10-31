import Vue from 'vue'
import VueLazyload from 'vue-lazyload' // Import lazyloading

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
})
