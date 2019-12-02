import { track } from 'insights-js'

const defaultSettings = {
  darkTheme: {
    value: false,
  },
  lazyLoading: {
    value: true,
  },
  infiniteLoad: {
    value: false,
  },
  score: {
    value: 0,
  },
  fullSizeImages: {
    value: false,
  },
  videoControls: {
    value: true,
  },
  hoverControls: {
    value: false,
  },
  zoom: {
    value: false,
  },
  keyboardControls: {
    value: true,
  },
  nsfw: {
    value: true,
  },
}

function tagsTracking(data) {
  return new Promise(function(resolve, reject) {
    // Test to see if theres any data passed
    if (!data.length) {
      reject(new Error('No tags passed'))
    }

    // Execute successfully the code
    Object.keys(data).forEach(function(key, index) {
      console.log(key, data[key])

      // Send tags in an interval of .5 seconds to not flood the analytics server
      setTimeout(function() {
        // console.log("Sent tag: ", data[key]);
        track({
          id: 'user-usage',
          parameters: {
            searchedTags: data[key],
          },
        })
      }, 500 * index)
    })

    resolve('Tags executed succesfully')
  })
}

function settingsTracking(data) {
  return new Promise(function(resolve, reject) {
    // Compare default settings to user settings to see if theres a difference
    const difference = Object.keys(data).filter(
      key => data[key].value !== defaultSettings[key].value
    )

    // If theres no difference then reject
    if (difference.length === 0) {
      reject(new Error('No setting difference'))
    }

    // When we know theres a difference, track each difference
    Object.keys(difference).forEach(function(key, index) {
      // console.log(key, difference[key]);

      // Send settings in an interval of .5 seconds to not flood the analytics server
      setTimeout(function() {
        // console.log("Sent setting: ", difference[key]);
        track({
          id: 'user-usage',
          parameters: {
            userSettings: difference[key],
          },
        })
      }, 500 * index)
    })

    resolve('Settings executed succesfully')
  })
}

/* -------- Analytics -------- */
export default async function fireAnalytics(type, data) {
  // console.log('Analytics fired with something:', type, data)
  let result
  switch (type) {
    // Track searched tags
    case 'tags':
      result = await tagsTracking(data)

      return result

    // Track different settings
    case 'settings':
      result = await settingsTracking(data)

      return result
  }
}
