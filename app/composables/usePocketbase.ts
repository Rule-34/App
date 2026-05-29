import type { ISimplePocketbasePost } from '~/assets/js/pocketbase.dto'

export default function () {
  const { $pocketBase } = useNuxtApp()

  const email = useState<string | null>('pocketbase-email', () => null)
  const license = useState<string | null>('pocketbase-license', () => null)
  const subscription_expires_at = useState<string | null>('pocketbase-subscription_expires_at', () => null)

  const authModel = $pocketBase.authStore.model
  const userId = $pocketBase.authStore.isValid && authModel?.id ? authModel.id : 'anonymous'
  const savedPostList = useLocalState<ISimplePocketbasePost[]>(`pocketbase-savedPostList-${userId}`, [])

  if ($pocketBase.authStore.isValid && authModel) {
    email.value = authModel.email
    license.value = authModel.username
    subscription_expires_at.value = authModel.subscription_expires_at
  }

  return {
    email,
    license,
    subscription_expires_at,

    savedPostList
  }
}
