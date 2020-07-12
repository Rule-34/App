import loadingAnimationHandler from '~/assets/js/loadingAnimationHandler'

import { createAPIURL } from '~/assets/js/createAPIURLFromBooruData.js'

export default {
  /**
   * Fetches data by mode
   * @param {*} param0
   * @param {Object} parameters (.url) Url to get data from | (.mutationToReturn) Mutation to return data to | (.domain) Domain to get the data from
   */
  async fetchWithMode({ dispatch, commit, state }, parameters) {
    // Animation for every request
    loadingAnimationHandler('start')

    // For every execution
    let response

    // Reset errors
    if (state.generalData.error) {
      commit({
        type: 'errorManager',
        operation: 'reset',
      })
    }

    console.debug(
      `Fetching data from Booru "${state.booruData.active.domain}" in ${parameters.mode} mode`
    )

    // Choose mode
    switch (parameters.mode) {
      case 'basic':
        // Fetch data
        response = await dispatch('simpleFetch', { url: parameters.url })
        break

      case 'posts':
        // Craft URL
        parameters.url = createAPIURL('posts', state)

        // Fetch data
        response = await dispatch('simpleFetch', {
          url: parameters.url,
        })

        // Set mutation to return
        parameters.mutationToReturn = 'dashBoardManager'
        break

      case 'single-post':
        // Craft URL
        parameters.url = createAPIURL('single-post', state, parameters)

        // Fetch data
        response = await dispatch('simpleFetch', {
          url: parameters.url,
        })

        // Set mutation to return
        parameters.mutationToReturn = 'dashBoardManager'
        parameters.returnMode = 'add'
        break

      case 'tags':
        // Craft URL
        parameters.url = createAPIURL('tags', state, parameters)

        // Fetch data
        response = await dispatch('simpleFetch', {
          url: parameters.url,
        })

        // Set mutation to return
        parameters.mutationToReturn = 'searchManager'
        parameters.returnMode = 'changeData'

        break

      case 'filter':
        // Fetch data
        response = await dispatch('simpleFetch', {
          url:
            'https://cdn.statically.io/gist/AlejandroAkbal/2fe43e0eee40be63d9b2a582b2793cf9/raw/app-furry-filter.min.json',
        })

        // Set mutation to return
        parameters.mutationToReturn = 'searchManager'
        parameters.returnMode = 'changeFilterData'

        break

      default:
        throw new Error('No mode specified')
    }

    if (!response) {
      console.debug('Returned nothing')

      loadingAnimationHandler('finish')

  loadingAnimationHandler(_, mode) {
    if (!window.$nuxt.$root.$loading.start) {
      console.debug('Skipping animation until everything is loaded')
      return
    }

    // If we want to pass back data we return
    if (parameters.mutationToReturn === 'return') {
      return response
    }

    // Add the successful response to the state
    commit({
      type: parameters.mutationToReturn,
      data: response,
      mode: parameters.returnMode,
    })

    loadingAnimationHandler('finish')
  },

  /**
   * Simple fetch that returns error to vue store
   * @param {*} param0
   * @param {String} url URL to fetch
   */
  async simpleFetch({ commit }, { url, options }) {
    const data = await fetch(url, options)
      // Save the data
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request rejected with status ${response.status}`)
        }
    switch (mode) {
      case 'start':
        console.debug('Starting loading animation')

        return response.json()
      })
        window.$nuxt.$root.$loading.start()
        break

      // Catch errors and commit to errorManager
      .catch((error) => {
        commit({
          type: 'errorManager',
          operation: 'set',
          data: error,
        })
      case 'finish':
        console.debug('Stopping loading animation')

        return false
      })
        window.$nuxt.$root.$loading.finish()
        break

    return data
      default:
        throw new Error('No mode specified')
    }
  },
}
