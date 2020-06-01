import Vue from 'vue'
import VueMatomo from 'vue-matomo'

export default ({ app }) => {
  Vue.use(VueMatomo, {
    host: 'https://matomo.akbal.dev',
    siteId: 1,

    trackerUrl: 'https://matomo.akbal.dev/m',

    trackerScriptUrl: 'https://matomo.akbal.dev/m.js',

    router: app.router,

    disableCookies: true,

    enableHeartBeatTimer: true,
    heartBeatTimerInterval: 30,

    debug: process.env.NODE_ENV === 'development',

    // preInitActions: [],
  })
}
