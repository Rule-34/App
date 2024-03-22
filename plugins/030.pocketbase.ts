import PocketBase from 'pocketbase';

export default defineNuxtPlugin(async ({ app }) => {

    const config = useRuntimeConfig()

    const pb = new PocketBase('https://pocketbase.r34.app')

    const cookie = useCookie('pb_auth', {
        path: '/',
        secure: true,
        sameSite: 'strict',
        httpOnly: false,
        maxAge: 604800,
    })

    // load the store data from the cookie value
    pb.authStore.save(cookie.value?.token, cookie.value?.model);

    // send back the default 'pb_auth' cookie to the client with the latest store state
    pb.authStore.onChange(() => {
        cookie.value = {
            token: pb.authStore.token,
            model: pb.authStore.model,
        };
    });

    try {
        // TODO: Only refresh the auth model if it's expired
        // get an up-to-date auth store state by verifying and refreshing the loaded auth model (if any)
        // pb.authStore.isValid && await pb.collection('users').authRefresh();
    } catch (_) {
        // clear the auth store on failed refresh
        pb.authStore.clear();
    }

    return {
        parallel: true,

        provide: { pocketBase: pb }
    }
});