export default defineNuxtRouteMiddleware(() => {
  const { $pocketBase } = useNuxtApp()
  const localePath = useLocalePath()

  if (!$pocketBase.authStore.isValid) {
    return navigateTo(localePath({ path: '/premium/sign-in', query: { authFailed: 'true' } }))
  }

  // Continue
  return
})
