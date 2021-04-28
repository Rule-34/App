import VuexPersistence from 'vuex-persist'

export default (context) => {
  const {
    store,
    $localForage,
    app: { router },
  } = context

  // Booru state
  new VuexPersistence({
    key: 'vuex-booru',

    storage: $localForage,
    asyncStorage: true,

    reducer: (state) => ({
      booru: {
        history: state.booru.history,
      },
    }),
  }).plugin(store)

  // Default state
  new VuexPersistence({
    key: 'vuex-root',

    storage: $localForage,
    asyncStorage: true,

    reducer: (state) => ({
      statistics: state.statistics,
    }),
  }).plugin(store)

  // Notifications state
  new VuexPersistence({
    key: 'vuex-notifications',

    storage: $localForage,
    asyncStorage: true,

    reducer: (state) => ({
      notifications: {
        // Double because the state and module are named the same
        notifications: {
          latestTitle: state.notifications.notifications.latestTitle,
        },
      },
    }),
  }).plugin(store)

  // User state
  new VuexPersistence({
    key: 'vuex-user',

    storage: $localForage,
    asyncStorage: true,

    reducer: (state) => {
      const SETTINGS_OBJ = {}

      // Recreate every setting's value path to save them to localStorage (this way we dont save other data like titles, defaultValue, etc.)
      Object.keys(state.user.settings).forEach((key) => {
        SETTINGS_OBJ[key] = {
          value: state.user.settings[key].value,
        }
      })

      return {
        user: {
          custom: state.user.custom,
          settings: SETTINGS_OBJ,
        },
      }
    },
  }).plugin(store)

  // Fix for async storage
  const waitForStorageToBeReady = async (to, from, next) => {
    await store.restored
    next()
  }

  router.beforeEach(waitForStorageToBeReady)
}
