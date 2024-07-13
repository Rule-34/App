export default defineNuxtRouteMiddleware((to, from) => {
  const { $pocketBase } = useNuxtApp()

  if (!$pocketBase.authStore.isValid) {
    return navigateTo('/premium/sign-in?message=Failed to authenticate. Please sign in again.')
  }

  // Continue
  return
})
