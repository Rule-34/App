// Send tags in an interval of .5 seconds to not flood the analytics server
function SendTimed(index, passedCallback) {
  setTimeout(passedCallback, 500 * index)
}

function trackEvent({ category, action, name, value }) {
  console.debug(`
  ---- Tracking event ----
  Category: ${category}
  Action: ${action}
  Name: ${name}
  Value: ${value}
  `)

  window._paq.push(['trackEvent', category, action, name, value])
}

function domainTracking(domain) {
  SendTimed(
    0,
    trackEvent({
      category: 'Domains',
      action: 'changed',
      name: domain,
    })
  )
}

function settingsTracking(state) {
  // Compare default settings to user settings to see if theres a difference
  const difference = Object.keys(state).filter(
    (key) => state[key].value !== state[key].defaultValue
  )

  if (!difference.length) {
    console.debug('No setting difference')
    return
  }

  Object.keys(difference).forEach((key, index) => {
    // console.log(key, difference[key])

    SendTimed(
      index,
      trackEvent({
        category: 'Settings',
        action: 'toggled',
        name: difference[key],
      })
    )
  })
}

function notificationsTracking() {
  SendTimed(
    0,
    trackEvent({
      category: 'Notifications',
      action: 'opened',

function supportPopUpTracking() {
  SendTimed(
    0,
    trackEvent({
      category: 'PopUp',
      action: 'Shown',
      name: 'Support',
    })
  )
}

/* -------- Analytics -------- */
export default function fireAnalytics(mode, { state, domain } = {}) {
  let result

  switch (mode) {
    case 'domain':
      result = domainTracking(domain)
      break

    case 'settings':
      result = settingsTracking(state)
      break

    case 'notifications':
      result = notificationsTracking()
      break

    case 'supportPopUp':
      result = supportPopUpTracking()
      break

    default:
      throw new Error('No mode specified')
  }

  return result
}
