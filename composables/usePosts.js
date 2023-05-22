import { computed, ref } from 'vue'
import { useUserSettings } from '~/composables/useUserSettings'
import { toast } from 'vue-sonner'

const userSettings = useUserSettings()

export function usePosts(initialPostsPage) {
  const loadedPostsPages = ref([])

  // Watch for changes in the initial posts page and reset the loaded posts pages
  watch(initialPostsPage, () => {
    loadedPostsPages.value = []
  })

  const mergedPostsPages = computed(() => {
    if (!initialPostsPage.value) {
      return []
    }

    const mergedPosts = [initialPostsPage.value, ...loadedPostsPages.value]

    return (
      mergedPosts
        // Sorted by page number
        // TODO: Improve this code so they don't have to be sorted (same array?)
        .sort((a, b) => a.meta.current_page - b.meta.current_page)
    )
  })

  // Merge posts from all pages into a single array, removing duplicates and keeping the order
  // Data can change. use `post.id` to identify the post
  const posts = computed(() => {
    if (!mergedPostsPages.value.length) {
      return []
    }
    const uniquePosts = []
    const uniquePostsKeys = new Set()

    // Remove duplicates
    for (const page of mergedPostsPages.value) {
      for (const post of page.data) {
        if (!uniquePostsKeys.has(post.id)) {
          uniquePostsKeys.add(post.id)
          uniquePosts.push(post)
        }
      }
    }

    // Filter posts
    uniquePosts.filter((post) => {
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

  const firstPosts = computed(() => mergedPostsPages.value[0])
  const lastPosts = computed(() => mergedPostsPages.value.at(-1))

  async function loadNextPosts() {
    const links = lastPosts.value.links

    if (!links.next) {
      console.debug('There is no next page')
    }

    const postsPage = await $fetch(links.next)
      //
      .catch((error) => {
        console.error(error)
        toast.error(`Failed to load next posts: "${error.message}"`)
      })

    loadedPostsPages.value.push(postsPage)
  }

  // async function loadPrevPosts() {
  //   const links = firstPosts.value.links
  //
  //   if (!links.prev) {
  //   }
  // }

  const isThereNextPosts = computed(() => {
    return lastPosts.value.meta.items_count === userSettings.postsPerPage
  })
  const isTherePrevPosts = computed(() => {
    return firstPosts.value.links.prev != null
  })

  return {
    posts,

    lastPosts,
    firstPosts,

    isThereNextPosts,
    isTherePrevPosts,

    // Methods
    loadNextPosts
    // loadPrevPosts
  }
}
