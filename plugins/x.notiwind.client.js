import Notifications from 'notiwind'
import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.vueApp.use(Notifications)
})
