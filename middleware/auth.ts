export default defineNuxtRouteMiddleware((to, from) => {
  const { $pocketBase } = useNuxtApp()
  const localePath = useLocalePath()

  // Skip auth checks in tests so premium page tests don't redirect
  if (useRuntimeConfig().public.testAuthBypass) return

  if (!$pocketBase.authStore.isValid) {
    return navigateTo(localePath('/premium/sign-in?authFailed=true'))
  }

  // Continue
  return
})
