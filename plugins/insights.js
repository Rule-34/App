import { init, track, parameters } from 'insights-js'

const debug = process.env.NODE_ENV !== 'production'

/* -------- Analytics -------- */
if (!debug) {
  init('kQrGvntXWy9eDO4h')
  track({
    id: 'user-usage',
    parameters: {
      path: parameters.path(),
      locale: parameters.locale(),
      screenType: parameters.screenType(),
      referrer: parameters.referrer(),
      duration: parameters.durationInterval(5000)
    }
  })
}
