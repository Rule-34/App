export default function () {
  const { $pocketBase } = useNuxtApp()
  const { subscription_expires_at, license, email } = usePocketbase()
  const hydrated = useAuthHydrated()

  const hasPremiumAccess = computed(
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
  )

  return {
    /** Known on the client as soon as the plugin ran: for route middleware and other logic, never for rendering. */
    hasPremiumAccess,

    /** For rendering: false until hydration has finished, so the first client render matches the anonymous SSR HTML. */
    isPremium: computed(() => hydrated.value && hasPremiumAccess.value),

    /** For markup that only free visitors get: added after mount, never in the shared SSR HTML (removing it would unmount un-hydrated nodes). */
    isFree: computed(() => hydrated.value && !hasPremiumAccess.value),

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
