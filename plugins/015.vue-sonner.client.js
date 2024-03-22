import { toast } from 'vue-sonner'

export default defineNuxtPlugin((nuxtApp) => {
  return {
    parallel: true,

    provide: {
      toast
    }
  }
})
