export default defineNuxtRouteMiddleware((to, from) => {
  const { $pocketBase } = useNuxtApp()
  const localePath = useLocalePath()

  if (!$pocketBase.authStore.isValid) {
    return navigateTo(
      localePath('/premium/sign-in?authFailed=true')
    )
  }

  // Continue
  return
})
