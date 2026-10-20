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

// The server never knows who is logged in: HTML is cached and shared, so SSR output must not depend on the visitor.
// Auth is applied on the client only; `useUserData().isPremium` stays false until the app has mounted.
// https://github.com/pocketbase/js-sdk#ssr-integration
export default defineNuxtPlugin<{ pocketBase: PocketBase }>({
  name: 'pocketbase',
  parallel: true,
  async setup(nuxtApp) {
    const pb = new PocketBase('https://pocketbase.r34.app')

    const hydrated = useAuthHydrated()

    if (import.meta.server) {
      return { provide: { pocketBase: pb } }
    }

    const cookie = useCookie<PocketBaseAuthCookie | null>('pb_auth', {
      path: '/',
      secure: window.location.protocol === 'https:',
      sameSite: 'strict',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 90 // 90 days // Same as PocketBase config?
    })

    // load the store data from the cookie value
    const authCookie = parsePocketBaseAuthCookie(cookie.value)

    if (authCookie?.token) {
      pb.authStore.save(authCookie.token, authCookie.model)
    }

    // keep the 'pb_auth' cookie in sync with the latest store state
    pb.authStore.onChange(() => {
      cookie.value = {
        token: pb.authStore.token,
        model: pb.authStore.model
      }
    })

    nuxtApp.hook('app:mounted', () => {
      hydrated.value = true
    })

    try {
      // get an up-to-date auth store state by verifying and refreshing the loaded auth model (if any)
      if (pb.authStore.isValid) {
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
