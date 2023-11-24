import VueSafeTeleport from 'vue-safe-teleport'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueSafeTeleport)
})
