import { event } from 'vue-analytics'

// Send tags in an interval of .5 seconds to not flood the analytics server
export function SendTimed(index, category, action, value) {
  setTimeout(function () {
    console.debug(`
    ---- Analytic tracking ----
    Category: ${category}
    Action: ${action}
    Value: ${value}
    `)

    event(category, action, value)
  }, 500 * index)
}

function tagsTracking(data) {
  return new Promise(function (resolve, reject) {
    // Test to see if theres any data passed
    if (!data.length) {
      resolve('No tags passed')
    }

    Object.keys(data).forEach(function (key, index) {
      // console.log(key, data[key])

      SendTimed(index, 'Tags', 'searched', data[key])
    })

    // End execution
    resolve('Tags executed succesfully')
  })
}

function booruTracking(data) {
  return new Promise(function (resolve, reject) {
    // Test to see if theres any data passed
    if (!data) {
      resolve('No domain passed')
    }

    SendTimed(0, 'Domains', 'changed', data)

    resolve('Domain executed succesfully')
  })
}

function settingsTracking(data) {
  return new Promise(function (resolve, reject) {
    // Compare default settings to user settings to see if theres a difference
    const difference = Object.keys(data).filter(
      (key) => data[key].value !== data[key].defaultValue
    )

    // If theres no difference then reject
    if (!difference.length) {
      resolve('No setting difference')
    }

    // When we know theres a difference, track each difference
    Object.keys(difference).forEach(function (key, index) {
      // console.log(key, difference[key])

      SendTimed(index, 'Settings', 'toggled', difference[key])
    })

    resolve('Settings executed succesfully')
  })
}

/* -------- Analytics -------- */
export default async function fireAnalytics(type, data) {
  // console.log('Analytics fired with something:', type, data)
  let result
  switch (type) {
    case 'tags':
      result = await tagsTracking(data)
      break

    case 'booru':
      result = await booruTracking(data)
      break

    case 'settings':
      result = await settingsTracking(data)

      return result
  }

  return result
}
