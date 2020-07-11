import VuexPersistence from 'vuex-persist'

export default ({ store }) => {
  // Root State
  new VuexPersistence({
    key: 'state',

    reducer: (state) => ({
      booruData: { active: state.booruData.active },
    }),
  }).plugin(store)

  // User state
  new VuexPersistence({
    key: 'user',

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
          settings: SETTINGS_OBJ,
        },
      }
    },
  }).plugin(store)

  // Premium State
  new VuexPersistence({
    key: 'premium',

    reducer: (state) => ({
      premium: {
        gumroad: {
          product: { license_key: state.premium.gumroad.product.license_key },
        },
      },
    }),
  }).plugin(store)

  // Notifications state
  new VuexPersistence({
    key: 'notifications',

    reducer: (state) => ({
      notifications: {
        // Double because the state and module are named the same
        notifications: {
          latestTitle: state.notifications.notifications.latestTitle,
        },
      },
    }),
  }).plugin(store)
}
