export function useUserData() {
  const { status, data } = useAuth()

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
