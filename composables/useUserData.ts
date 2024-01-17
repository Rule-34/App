export function useUserData() {
  const { loggedIn, user } = useAuth()

  return {
    isPremium: computed(
      //
      () => {
        if (!loggedIn) {
          return false
        }

        return user.is_subscription_valid
      }
    ),

    email: computed(
      //
      () => {
        if (!loggedIn) {
          return null
        }

        return user.email
      }
    )
  }
}
