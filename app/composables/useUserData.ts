export default function () {
  const { $pocketBase } = useNuxtApp()
  const { subscription_expires_at, license, email } = usePocketbase()

  return {
    isPremium: computed(
      //
      () => {
        // TODO: Check why this changes so many times
        if (!$pocketBase.authStore.isValid) {
          return false
        }

        if (!subscription_expires_at.value) {
          return false
        }

        return new Date(subscription_expires_at.value) > new Date()
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
    ),

    license: computed(
      //
      () => {
        if (!$pocketBase.authStore.isValid) {
          return null
        }

        return license.value
      }
    )
  }
}
