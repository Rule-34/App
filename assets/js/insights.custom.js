import { track } from 'insights-js'

// Send tags in an interval of .5 seconds to not flood the analytics server
function SendTimed(data, index, parameter) {
  setTimeout(function() {
    console.log('Tracked item: ', data, index, parameter)

    // Then track tags
    track({
      id: 'user-usage',
      parameters: {
        [parameter]: data,
      },
    })
  }, 500 * index)
}

function tagsTracking(data, premadeFilterData) {
  return new Promise(function(resolve, reject) {
    let isFromFilter = false // In case tags are from filter
    let index = 0 // Workaround, if not done then tags are sent with a lot of delay

    // Test to see if theres any data passed
    if (!data.length) {
      resolve('No tags passed')
    }

    // Execute successfully the code
    Object.keys(data).forEach(function(key) {
      // console.log(key, data[key])

      // If the key is from the preFab then dont send anything and skip to next
      if (premadeFilterData.includes(data[key])) {
        // console.log('Not sent tag', data[key])
        isFromFilter = true

        // Skip to next
        return
      }

      // If not skipped, send tags in an interval of .5 seconds to not flood the analytics server
      SendTimed(data[key], index, 'searchedTags')

      // Add one to index
      index++
    })

    // If variables are from filter then send a unique event that identifies that it has been used
    if (isFromFilter) {
      console.log('Tracked Premade Filter')

      track({
        id: 'user-usage',
        parameters: {
          searchedTags: 'Premade Filter',
        },
      })
    }

    // End execution
    resolve('Tags executed succesfully')
  })
}

function domainTracking(data) {
  return new Promise(function(resolve, reject) {
    // Test to see if theres any data passed
    if (!data) {
      resolve('No domain passed')
    }

    // Execute successfully the code
    track({
      id: 'user-usage',
      parameters: {
        domainUsed: data,
      },
    })

    resolve('Domain executed succesfully')
  })
}

function settingsTracking(data) {
  return new Promise(function(resolve, reject) {
    // Compare default settings to user settings to see if theres a difference
    const difference = Object.keys(data).filter(
      key => data[key].value !== data[key].defaultValue
    )

    // If theres no difference then reject
    if (difference.length === 0) {
      resolve('No setting difference')
    }

    // When we know theres a difference, track each difference
    Object.keys(difference).forEach(function(key, index) {
      // console.log(key, difference[key])

      // Send settings in an interval of .5 seconds to not flood the analytics server
      SendTimed(difference[key], index, 'userSettings')
    })

    resolve('Settings executed succesfully')
  })
}

/* -------- Analytics -------- */
export default async function fireAnalytics(type, data, premadeFilterData) {
  // console.log('Analytics fired with something:', type, data)
  let result
  switch (type) {
    // Track searched tags
    case 'tags':
      result = await tagsTracking(data, premadeFilterData)

      return result

    // Track searched tags
    case 'domain':
      result = await domainTracking(data)

      return result

    // Track different settings
    case 'settings':
      result = await settingsTracking(data)

      return result
  }
}
