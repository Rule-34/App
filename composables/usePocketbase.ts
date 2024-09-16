import { useStorage } from '@vueuse/core'
import type { IPocketbasePost } from '~/assets/js/pocketbase.dto'

export default function () {
  const { $pocketBase } = useNuxtApp()

  let email = ref<string | null>(null)
  let license = ref<string | null>(null)
  let subscription_expires_at = ref<string | null>(null)

  let savedPostList = ref<IPocketbasePost[]>([])

  onMounted(() => {
    savedPostList = useStorage<IPocketbasePost[]>('pocketbase-savedPostList', [], localStorage, {
      writeDefaults: false
    })

    if ($pocketBase.authStore.isValid) {
      //

      callOnce(async () => {
        //
        email.value = await $pocketBase.authStore.model.email
        license.value = await $pocketBase.authStore.model.username
        subscription_expires_at.value = await $pocketBase.authStore.model.subscription_expires_at

        savedPostList.value = await $pocketBase.collection('posts').getFullList<IPocketbasePost>({
          fields: 'id, original_id, original_domain',

          requestKey: 'savedPostList'
        })

        await $pocketBase.collection('posts').subscribe<IPocketbasePost>(
          '*',
          function (e) {
            switch (e.action) {
              case 'create':
                savedPostList.value.push(e.record)
                break

              case 'update':
                const index = savedPostList.value.findIndex((post) => post.id === e.record.id)
                savedPostList.value[index] = e.record
                break

              case 'delete':
                savedPostList.value = savedPostList.value.filter((post) => post.id !== e.record.id)
                break
            }
          },
          {
            fields: 'id, original_id, original_domain'
          }
        )
      })
    }
  })

  return {
    email,
    license,
    subscription_expires_at,

    savedPostList
  }
}
