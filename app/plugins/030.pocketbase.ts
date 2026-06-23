import PocketBase from 'pocketbase'

type AuthStoreModel = Parameters<PocketBase['authStore']['save']>[1]
type PocketBaseAuthCookie = {
  token?: string
  model?: AuthStoreModel
}

function parsePocketBaseAuthCookie(
  cookie: PocketBaseAuthCookie | string | null | undefined
): PocketBaseAuthCookie | null {
  if (!cookie) {
    return null
  }

  if (typeof cookie !== 'string') {
    return cookie
  }

  try {
    return JSON.parse(decodeURIComponent(cookie)) as PocketBaseAuthCookie
  } catch {
    return null
  }
}

// https://github.com/pocketbase/js-sdk#ssr-integration
export default defineNuxtPlugin<{ pocketBase: PocketBase }>({
  name: 'pocketbase',
  parallel: true,
  async setup() {
    const pb = new PocketBase('https://pocketbase.r34.app')
    const secureCookie = import.meta.server
      ? useRequestURL().protocol === 'https:'
      : window.location.protocol === 'https:'

    // TODO: Store in localStorage for better caching
    const cookie = useCookie<PocketBaseAuthCookie | null>('pb_auth', {
      path: '/',
      secure: secureCookie,
      sameSite: 'strict',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 90 // 90 days // Same as PocketBase config?
    })

    // load the store data from the cookie value
    const authCookie = parsePocketBaseAuthCookie(cookie.value)

    if (authCookie?.token) {
      pb.authStore.save(authCookie.token, authCookie.model)
    }

    // send back the default 'pb_auth' cookie to the client with the latest store state
    pb.authStore.onChange(() => {
      cookie.value = {
        token: pb.authStore.token,
        model: pb.authStore.model
      }
    })

    try {
      // get an up-to-date auth store state by verifying and refreshing the loaded auth model (if any)
      if (pb.authStore.isValid && import.meta.client) {
        await pb.collection('users').authRefresh()
      }
    } catch {
      // clear the auth store on failed refresh
      pb.authStore.clear()
    }

    return {
      provide: { pocketBase: pb }
    }
  }
})
