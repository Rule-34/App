// Send tags in an interval of .5 seconds to not flood the analytics server
function SendTimed(index, category, action, name, value) {
  setTimeout(function () {
    console.debug(`
    ---- Analytic tracking ----
    Category: ${category}
    Action: ${action}
    Value: ${name}
    Value: ${value}
    `)

    // In reality its ['trackEvent', category, [name], [value]] but here we skip it
    if (name) {
      window._paq.push(['trackEvent', category, action, name])
    } else {
      window._paq.push(['trackEvent', category, action])
    }
  }, 500 * index)
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

    SendTimed(index, 'Tags', 'searched', tag)
  })

  if (isFromFilter) {
    // console.debug('Tracked Premade Filter')

    SendTimed(0, 'Tags', 'searched', 'Premade Filter')
  }

  // console.debug('Tags executed succesfully')
}

function booruTracking(state) {
  SendTimed(0, 'Domains', 'changed', state.booruData.active.domain)

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

    SendTimed(index, 'Settings', 'toggled', difference[key])
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

    case 'booru':
      result = booruTracking(state)
      break

    case 'settings':
      result = settingsTracking(state)
      break

    case 'notifications':
      result = SendTimed(0, 'Notifications', 'opened')
      break

    default:
      throw new Error('No mode specified')
  }

  return result
}
