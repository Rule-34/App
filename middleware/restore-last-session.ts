import { useRestoreLastSessionPopup } from '~/composables/useRestoreLastSessionPopup'

let hasAppBooted = false

export default defineNuxtRouteMiddleware((to, from) => {
  const { lastPostsPage, toggleMenu } = useRestoreLastSessionPopup()

  // Show menu on first app boot
  // And skip if going to the same page
  if (!hasAppBooted && to.fullPath !== lastPostsPage.value) {
    hasAppBooted = true

    onNuxtReady(() => {
      toggleMenu(true)
    })
    return
  }

  if (to.name !== 'posts') {
    return
  }

  // Skip if same route
  if (to.fullPath === from.fullPath) {
    return
  }

  // TODO: Skip if only has booru
  // TODO: Skip if to has default values

  lastPostsPage.value = to.fullPath
})
