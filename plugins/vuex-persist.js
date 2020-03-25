import VuexPersistence from 'vuex-persist'

export default ({ store }) => {
  // Hydrate data
  new VuexPersistence({
    reducer: (state) => {
      const SETTINGS_OBJ = { userSettings: {} }

      // Recreate every setting's value path to save them to localStorage (this way we dont save other data like titles, defaultValue, etc.)
      Object.keys(state.userSettings).forEach((key) => {
        SETTINGS_OBJ.userSettings[key] = {
          value: state.userSettings[key].value,
        }
      })

      // console.log(SETTINGS_OBJ)

      // Recreate the part of the store that we want to save
      return {
        // Dashboard
        dashBoardSettings: state.dashBoardSettings,

        // Notifications
        notificationData: {
          data: state.notificationData.data,
          latestTitle: state.notificationData.latestTitle,
        },

        // userSettings
        ...SETTINGS_OBJ,

        // Patreon data
        patreonCredentials: state.patreonCredentials,
      }
    },
  }).plugin(store)
}
