import { useStorage } from '@vueuse/core'
import type { IPocketbasePost } from '~/assets/js/pocketbase.dto'

let email = ref<string | null>(null)
let active = ref<boolean | null>(null)

let savedPostList = ref<IPocketbasePost[]>([])

if (process.client) {
  savedPostList = useStorage<IPocketbasePost[]>('pocketbase-savedPostList', [], localStorage, {
    writeDefaults: false
  })
}

export function usePocketbase() {
  const { $pocketBase } = useNuxtApp()

  if (process.client && $pocketBase.authStore.isValid) {
    //

    callOnce(async () => {
      //
      email.value = await $pocketBase.authStore.model.email
      active.value = await $pocketBase.authStore.model.active

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

  return {
    email,
    active,

    savedPostList
  }
}
