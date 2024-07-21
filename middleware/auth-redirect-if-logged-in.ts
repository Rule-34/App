export default defineNuxtRouteMiddleware((to, from) => {
  const { $pocketBase } = useNuxtApp()

  // Skip if license query is set
  if (to.query.license) {
    return
  }

  if ($pocketBase.authStore.isValid) {
    return navigateTo('/premium/dashboard')
  }

  // Continue
  return
})
