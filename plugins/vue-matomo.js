import Vue from 'vue'
import VueMatomo from 'vue-matomo'

export default ({ app }) => {
  Vue.use(VueMatomo, {

    host: 'https://matomo.akbal.dev',
    siteId: 1,

    router: app.router,

    disableCookies: true,

    enableHeartBeatTimer: true,
    heartBeatTimerInterval: 30,

    // debug: true,

    // preInitActions: [],
  })
}
