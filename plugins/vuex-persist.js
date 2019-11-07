import VuexPersistence from "vuex-persist";

export default ({ store }) => {
  window.onNuxtReady(() => {
    new VuexPersistence({
      /* your options */
      key: "vuex",
      storage: window.localStorage,
      reducer: state => ({
        userSettings: state.userSettings
      })
    }).plugin(store);
  });
};
