export default defineNuxtRouteMiddleware((to, from) => {

    if (!process.client) {
        return
    }

    const { $auth, $pocketBase } = useNuxtApp()

    if (($auth.loggedIn && !$pocketBase.authStore.isValid) || (!$auth.loggedIn && $pocketBase.authStore.isValid)) {

        // Log out from pocketbase
        $pocketBase.authStore.clear()

        let authCookie
        authCookie = useCookie('auth.strategy')
        authCookie.value = undefined

        authCookie = useCookie('auth._token.local')
        authCookie.value = undefined
        authCookie = useCookie('auth._token_expiration.local')
        authCookie.value = undefined

        authCookie = useCookie('auth._refresh_token.local')
        authCookie.value = undefined
        authCookie = useCookie('auth._refresh_token_expiration.local')
        authCookie.value = undefined

        // Log out from API
        // TODO: Restore when it works
        // await _signOut()

        window.location.reload()
    }


    return
})
