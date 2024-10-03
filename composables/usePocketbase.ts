import type { ISimplePocketbasePost } from '~/assets/js/pocketbase.dto'

export default function () {
  const { $pocketBase } = useNuxtApp()

  const email = useState<string | null>('pocketbase-email', () => null)
  const license = useState<string | null>('pocketbase-license', () => null)
  const subscription_expires_at = useState<string | null>('pocketbase-subscription_expires_at', () => null)

  const savedPostList = useLocalState<ISimplePocketbasePost[]>('pocketbase-savedPostList', [])

  if (import.meta.client) {
    if ($pocketBase.authStore.isValid) {
      //

      callOnce('pocketbase-initial-data', async () => {
        //
        email.value = await $pocketBase.authStore.model.email
        license.value = await $pocketBase.authStore.model.username
        subscription_expires_at.value = await $pocketBase.authStore.model.subscription_expires_at

        savedPostList.value = await $pocketBase.collection('posts').getFullList<ISimplePocketbasePost>({
          fields: 'id, original_id, original_domain',

          requestKey: 'savedPostList'
        })
      })
    }
  }

  return {
    email,
    license,
    subscription_expires_at,

    savedPostList
  }
}
