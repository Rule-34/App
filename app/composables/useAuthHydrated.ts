/**
 * Whether the client has mounted, so the signed-in session may change what is rendered.
 * False on the server and while hydrating SSR HTML (which is shared and anonymous); routes that are not
 * server-rendered can use the session straight away. Set by `app/plugins/030.pocketbase.ts`.
 */
export default function () {
  const nuxtApp = useNuxtApp()

  return useState<boolean>('auth-hydrated', () => import.meta.client && !nuxtApp.isHydrating)
}
