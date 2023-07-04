export default defineNuxtRouteMiddleware((to, from) => {
  const userSettings = useUserSettings()

  if (to.name !== 'posts') {
    return
  }

  // TODO: Skip if to has default values

  userSettings.lastPostsPage = to.fullPath
})
