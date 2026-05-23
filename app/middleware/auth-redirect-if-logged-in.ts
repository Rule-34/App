export default defineNuxtRouteMiddleware((to) => {
  const { $pocketBase } = useNuxtApp()
  const localePath = useLocalePath()

  // Skip if license query is set
  if (to.query.license) {
    return
  }

  if ($pocketBase.authStore.isValid) {
    return navigateTo(localePath('/premium/dashboard'))
  }

  // Continue
  return
})
