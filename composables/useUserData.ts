// TODO: Run migrations on https://nuxt.com/docs/api/utils/on-nuxt-ready

const { status, data } = useAuth()

export function useUserData() {
  return {
    isPremium: computed(
      //
      () => {
        if (status.value !== 'authenticated') {
          return false
        }

        return data.value.is_subscription_valid
      }
    ),

    email: computed(
      //
      () => {
        if (status.value !== 'authenticated') {
          return null
        }

        return data.value.email
      }
    )
  }
}
