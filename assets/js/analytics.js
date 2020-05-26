// Send tags in an interval of .5 seconds to not flood the analytics server
function SendTimed(index, passedCallback) {
  setTimeout(passedCallback, 500 * index)
}

function trackSearch({ name, category, results }) {
  console.debug(`
  ---- Tracking search ----
  Name: ${name}
  Category: ${category}
  Results: ${results}
  `)

  window._paq.push(['trackSiteSearch', name, category, results])
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

function tagsTracking(state) {
  let isFromFilter = false

  if (!state.searchData.tags.length) {
    console.debug('No tags to track')
    return
  }

  state.searchData.tags.forEach((tag, index) => {
    // console.log(tag, index)

    if (state.searchData.premadeFilterData.includes(tag)) {
      // console.log('Not sent tag', tag)
      isFromFilter = true

      return
    }

    SendTimed(
      index,
      trackSearch({
        name: tag,
        category: 'Tags',
      })
    )
  })

  if (isFromFilter) {
    // console.debug('Tracked Premade Filter')

    SendTimed(
      0,
      trackSearch({
        name: 'Premade Filter',
        category: 'Tags',
      })
    )
  }

  // console.debug('Tags executed succesfully')
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

  // console.debug('Domain executed succesfully')
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

  // console.debug('Settings executed succesfully')
}

/* -------- Analytics -------- */
export default function fireAnalytics(mode, state) {
  // console.log('Analytics fired with something:', mode, state)
  let result
  switch (mode) {
    case 'tags':
      result = tagsTracking(state)
      break

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
