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

function domainTracking(state) {
  SendTimed(
    0,
    trackEvent({
      category: 'Domains',
      action: 'changed',
      name: state.booruData.active.domain,
    })
  )
}

function settingsTracking(state) {
  // Compare default settings to user settings to see if theres a difference
  const difference = Object.keys(state.userSettings).filter(
    (key) =>
      state.userSettings[key].value !== state.userSettings[key].defaultValue
  )

  // If theres no difference then reject
  if (!difference.length) {
    console.debug('No setting difference')
    return
  }

  // When we know theres a difference, track each difference
  Object.keys(difference).forEach(function (key, index) {
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

/* -------- Analytics -------- */
export default function fireAnalytics(mode, state) {
  // console.log('Analytics fired with something:', mode, state)
  let result
  switch (mode) {
    case 'domain':
      result = domainTracking(state)
      break

    case 'settings':
      result = settingsTracking(state)
      break

    case 'notifications':
      result = SendTimed(
        0,
        trackEvent({
          category: 'Notifications',
          action: 'opened',
        })
      )
      break

    default:
      throw new Error('No mode specified')
  }

  return result
}
