import { computed } from 'vue'
import { useUserSettings } from '~/composables/useUserSettings'
import { toast } from 'vue-sonner'
import type { IPostPage } from '~/assets/js/post'

const { token: authToken } = useAuth()

const userSettings = useUserSettings()

export function usePosts(initialPostPages: Ref<IPostPage[] | null>) {
  //

  // Merge posts from all pages into a single array, removing duplicates and keeping the order
  // Data can change. use `post.id` to identify the post
  const posts = computed(() => {
    if (initialPostPages.value == null) {
      return []
    }

    let uniquePosts = []
    const uniquePostsKeys = new Set()

    // Remove duplicates
    for (const postPage of initialPostPages.value) {
      //

      for (const post of postPage.data) {
        //

        if (!uniquePostsKeys.has(post.id)) {
          uniquePostsKeys.add(post.id)
          uniquePosts.push(post)
        }
      }
    }

    // Filter posts
    uniquePosts = uniquePosts.filter((post) => {
      // Remove posts without a media file
      if (!post.high_res_file?.url) {
        return false
      }

      // Remove posts without a media type
      if (post.media_type === 'unknown') {
        return false
      }

      return true
    })

    // TODO: Deep freeze
    Object.freeze(uniquePosts)

    return uniquePosts
  })

  const firstPostPage = computed(() => {
    if (initialPostPages.value == null || !initialPostPages.value.length) {
      return null
    }

    return initialPostPages.value[0]
  })

  const lastPostPage = computed(() => {
    if (initialPostPages.value == null || !initialPostPages.value.length) {
      return null
    }

    return initialPostPages.value.at(-1)
  })

  const isThereNextPostPage = computed(() => {
    if (!lastPostPage.value) {
      return false
    }

    return lastPostPage.value.meta.items_count === userSettings.postsPerPage
  })

  const isTherePrevPostPage = computed(() => {
    if (!firstPostPage.value) {
      return false
    }

    return firstPostPage.value.links.prev != null
  })

  async function loadNextPostPage() {
    const links = lastPostPage.value.links

    if (!links.next) {
      console.debug('There is no next page')
    }

    const postsPage = await $fetch(links.next, {
      headers: {
        'Authorization': authToken.value
      }
    })
      //
      .catch((error) => {
        console.error(error)
        toast.error(`Failed to load next posts: "${ error.message }"`)
      })

    initialPostPages.value.push(postsPage)
  }

  // TODO: Prev posts

  return {
    posts,

    lastPostPage,
    firstPostPage,

    isThereNextPostPage,
    isTherePrevPostPage,

    // Methods
    loadNextPostPage
  }
}
