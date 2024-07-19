export function useUserData() {
  const { $pocketBase } = useNuxtApp()
  const { subscription_expires_at, email } = usePocketbase()

  return {
    isPremium: computed(
      //
      () => {
        if (!$pocketBase.authStore.isValid) {
          return false
        }

        if (!subscription_expires_at.value) {
          return false
        }
        
        return true
      }
    ),

    email: computed(
      //
      () => {
        if (!$pocketBase.authStore.isValid) {
          return null
        }

        return email.value
      }
    )
  }
}
