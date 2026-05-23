import type { ISimplePocketbasePost } from '~/assets/js/pocketbase.dto'

export default function () {
  const { $pocketBase } = useNuxtApp()

  const email = useState<string | null>('pocketbase-email', () => null)
  const license = useState<string | null>('pocketbase-license', () => null)
  const subscription_expires_at = useState<string | null>('pocketbase-subscription_expires_at', () => null)

  const savedPostList = useLocalState<ISimplePocketbasePost[]>('pocketbase-savedPostList', [])

  const authModel = $pocketBase.authStore.model

  if ($pocketBase.authStore.isValid && authModel) {
    //

    email.value = authModel.email
    license.value = authModel.username
    subscription_expires_at.value = authModel.subscription_expires_at

    if (import.meta.client) {
      //

      callOnce('pocketbase-initial-data', async () => {
        //

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
