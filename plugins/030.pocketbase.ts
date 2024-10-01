import PocketBase from 'pocketbase'

// https://github.com/pocketbase/js-sdk#ssr-integration
export default defineNuxtPlugin(async ({ app }) => {
  const config = useRuntimeConfig()

  const pb = new PocketBase('https://xp25fi549jbaycm.pockethost.io/')

  // TODO: Store in localStorage for better caching
  const cookie = useCookie('pb_auth', {
    path: '/',
    secure: true,
    sameSite: 'strict',
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 90 // 90 days // Same as PocketBase config?
  })

  // load the store data from the cookie value
  pb.authStore.save(cookie.value?.token, cookie.value?.model)

  // send back the default 'pb_auth' cookie to the client with the latest store state
  pb.authStore.onChange(() => {
    cookie.value = {
      token: pb.authStore.token,
      model: pb.authStore.model
    }
  })

  try {
    // get an up-to-date auth store state by verifying and refreshing the loaded auth model (if any)
    pb.authStore.isValid && (await pb.collection('users').authRefresh())
  } catch (_) {
    // clear the auth store on failed refresh
    pb.authStore.clear()
  }

  return {
    parallel: true,

    provide: { pocketBase: pb }
  }
})
