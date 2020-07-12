export default {
  /**
   * Simple fetch that returns error to vue store
   * @param {*} param0
   * @param {String} url URL to fetch
   */
  async simpleFetch({ dispatch }, { url, options }) {
    dispatch('loadingAnimationHandler', 'start')

    await dispatch({
      type: 'errorManager',
      operation: 'reset',
    })

    const data = await fetch(url, options)
      // Save the data
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request rejected with status ${response.status}`)
        }

        return response.json()
      })

      .catch((error) => {
        dispatch({
          type: 'errorManager',
          operation: 'set',
          value: error.message,
        })

        return false
      })

    dispatch('loadingAnimationHandler', 'finish')

    return data
  },

        break

        break

      default:
    }

  loadingAnimationHandler(_, mode) {
    if (!window.$nuxt.$root.$loading.start) {
      console.debug('Skipping animation until everything is loaded')
      return
    }

    switch (mode) {
      case 'start':
        console.debug('Starting loading animation')

        window.$nuxt.$root.$loading.start()
        break

      case 'finish':
        console.debug('Stopping loading animation')

        window.$nuxt.$root.$loading.finish()
        break

      default:
        throw new Error('No mode specified')
    }
  },
}
