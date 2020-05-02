import Vue from 'vue'
import VueMatomo from 'vue-matomo'

export default ({ app }) => {
  Vue.use(VueMatomo, {
    router: app.router,

    /** Other configuration options **/

    host: 'https://matomo.akbal.dev',
    siteId: 1,

    disableCookies: true,

    enableHeartBeatTimer: true,
    heartBeatTimerInterval: 30,

    // debug: true,

    // preInitActions: [],
  })
}
