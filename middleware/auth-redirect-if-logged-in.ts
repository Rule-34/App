export default defineNuxtRouteMiddleware((to, from) => {
  const { $pocketBase } = useNuxtApp()

  if ($pocketBase.authStore.isValid) {
    return navigateTo('/premium/dashboard')
  }

  // Continue
  return
})
