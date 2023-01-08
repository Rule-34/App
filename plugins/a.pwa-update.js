/**
 * @see https://github.com/nuxt-community/pwa-module/issues/239#issuecomment-1105120333
 */
export default async function checkForUpdate(context, err, firstTime = true) {
  if (!('serviceWorker' in navigator)) {
    console.debug('Service worker not supported')
    return
  }

  const registration = await navigator.serviceWorker.getRegistration()

  if (registration) {
    registration.update()

    if (firstTime) {
      registration.addEventListener('updatefound', () => {
        window.location.reload()
      })
    }
  }

  // Check again in 5 seconds
  setTimeout(() => checkForUpdate(context, err, false), 5000)
}
