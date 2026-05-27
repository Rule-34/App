export default defineNuxtPlugin({
  name: 'premium-cloud-sync',
  dependsOn: ['pocketbase'],
  setup() {
    const { $pocketBase } = useNuxtApp()

    if (!$pocketBase.authStore.isValid) {
      return
    }

    const { initializeInBackground } = usePremiumCloudSync()

    onNuxtReady(() => {
      void initializeInBackground()
    })
  }
})
