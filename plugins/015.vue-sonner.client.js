import { toast } from 'vue-sonner'

export default defineNuxtPlugin((nuxtApp) => {
  return {
    provide: {
      toast
    }
  }
})
