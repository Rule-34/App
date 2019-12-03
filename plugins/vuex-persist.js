import createPersistedState from 'vuex-persistedstate'

const localStorageData = JSON.parse(localStorage.getItem('vuex'))

export default ({ store }) => {
  // Define data before hydrating
  const initialStoreData = store.state.dashBoardSettings.contentDomain

  // Hydrate data
  window.onNuxtReady(() => {
    createPersistedState({
      key: 'vuex',
      paths: ['dashBoardSettings', 'userSettings'],

      // If when subsequential loading the page we have changed the domain data, reload the page when data is hydrated
      rehydrated() {
        // If we already have the same data then we dont need to reload the page
        if (
          localStorageData.dashBoardSettings.contentDomain === initialStoreData
        ) {
          console.info(
            'We have the same data in localStorage as in Vuex store, dont reload'
          )
          return
        }

        // Then load page with new domain data
        console.info(
          'Different localStorage domain detected, reloading posts with new domain'
        )
        store.dispatch('getPosts')
      },
    })(store)
  })
}
