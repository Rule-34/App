export function useUserData() {
  const { $pocketBase } = useNuxtApp()
  const { active, email } = usePocketbase()

  return {
    isPremium: computed(
      //
      () => {
        if (!$pocketBase.authStore.isValid) {
          return false
        }

        return active.value
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
