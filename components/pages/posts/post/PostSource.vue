<script lang="ts" setup>
  import { LinkIcon } from '@heroicons/vue/24/outline'
  import { toast } from 'vue-sonner'
  import { useFloating, offset, flip, shift } from '@floating-ui/vue'
  import type { IPost } from '~/assets/js/post.dto'

  const props = defineProps<{
    postSources: IPost['sources']

    postFileUrl: string
  }>()

  const { isPremium } = useUserData()
  const { tutorialPostSource } = useAppStatistics()

  const referenceEl = ref<HTMLElement>()
  const floatingEl = ref<HTMLElement>()

  const { floatingStyles } = useFloating(referenceEl, floatingEl, {
    placement: 'bottom-start',
    middleware: [offset(6), flip(), shift()]
  })

  const imageAnimeRelatedServiceOptions = [
    {
      title: 'Find with SauceNAO',
      link: `https://saucenao.com/search.php?url=${encodeURIComponent(props.postFileUrl)}`
    },
    {
      title: 'Find with ASCII2D',
      link: `https://ascii2d.net/search/url/${encodeURIComponent(props.postFileUrl)}`
    },
    {
      title: 'Find with IQDB',
      link: `https://iqdb.org/?url=${encodeURIComponent(props.postFileUrl)}`
    }
  ]

  const imageRelatedServiceOptions = [
    {
      title: 'Find with Google',
      link: `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(props.postFileUrl)}`
    },
    // TODO: Fix Yandex
    {
      title: 'Find with Yandex',
      link: `https://yandex.com/images/search?url=${encodeURIComponent(props.postFileUrl)}`
    },
    {
      title: 'Find with Bing',
      link: `https://www.bing.com/images/searchbyimage?cbir=sbi&imgurl=${encodeURIComponent(props.postFileUrl)}`
    },
    {
      title: 'Find with TinEye',
      link: `https://tineye.com/search/?url=${encodeURIComponent(props.postFileUrl)}`
    }
  ]

  function isSourceAnUrl(source: string) {
    try {
      new URL(source)
      return true
    } catch {
      return false
    }
  }

  function getHostnameFromUrl(url: string) {
    const source = new URL(url)

    return source.hostname
  }

  function getFriendlyStringFromHostname(hostname: string) {
    const friendlyString = hostname.replace('www.', '')

    return friendlyString
  }

  function openSourceFinder(url: string) {
    if (!isPremium.value) {
      const { open: promptPremium, currentIndex } = usePremiumDialog()

      currentIndex.value = 7
      promptPremium.value = true
      return
    }

    window.open(url, '_blank')
  }

  function onMenuOpen() {
    if (tutorialPostSource.value) {
      return
    }

    toast.info('Post Source', {
      description: 'Go to the source (artist) if it exists, or find it with reverse image search',
      duration: 10000
    })

    tutorialPostSource.value = true
  }
</script>

<template>
  <HeadlessMenu
    as="div"
    class="relative inline-block text-left"
  >
      <HeadlessMenuButton
        ref="referenceEl"
        aria-label="Open post source options"
        class="hover:hover-bg-util focus-visible:focus-outline-util group flex items-center rounded-md px-1.5 py-1"
        @click="onMenuOpen"
      >
        <LinkIcon aria-hidden="true" class="group-hover:hover-text-util text-base-content h-5 w-5" />
      </HeadlessMenuButton>

      <Teleport to="body">
        <Transition
          leave-active-class="transition ease-in duration-100"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <HeadlessMenuItems
            ref="floatingEl"
            :style="floatingStyles"
            class="divide-base-0/20 bg-base-1000 ring-base-0/20 w-56 divide-y rounded-md ring-1 focus:outline-hidden z-50"
          >
          <!-- No source found -->
          <div
            v-if="!postSources.length"
            class="py-1"
          >
            <span class="block px-4 py-2 text-sm"> No source found :( </span>
          </div>

          <!-- Sources -->
          <div
            v-else
            class="py-1"
          >
            <HeadlessMenuItem
              v-for="source of postSources"
              :key="source"
              v-slot="{ active }"
            >
              <template v-if="isSourceAnUrl(source)">
                <NuxtLink
                  :class="[active ? 'bg-base-0/20 text-base-content-highlight' : 'text-base-content']"
                  :href="source"
                  class="group flex w-full items-center px-4 py-2 text-sm"
                  target="_blank"
                >
                  <img
                    :src="`https://icons.duckduckgo.com/ip2/${getHostnameFromUrl(source)}.ico`"
                    alt="Favicon"
                    class="mr-3 h-5 w-5 shrink-0 rounded-sm"
                    height="128"
                    width="128"
                  />

                  <span class="truncate">
                    {{ getFriendlyStringFromHostname(getHostnameFromUrl(source)) }}
                  </span>
                </NuxtLink>
              </template>

              <template v-else>
                <span class="block px-4 py-2 text-sm break-words">
                  {{ source }}
                </span>
              </template>
            </HeadlessMenuItem>
          </div>

          <!-- Anime services -->
          <div class="py-1">
            <HeadlessMenuItem
              v-for="service in imageAnimeRelatedServiceOptions"
              v-slot="{ active }"
            >
              <button
                :class="[active ? 'bg-base-0/20 text-base-content-highlight' : 'text-base-content']"
                class="group ui-disabled:cursor-not-allowed ui-disabled:opacity-50 flex w-full items-center px-4 py-2 text-sm"
                type="button"
                @click="openSourceFinder(service.link)"
              >
                <img
                  :src="`https://icons.duckduckgo.com/ip2/${getHostnameFromUrl(service.link)}.ico`"
                  alt="Favicon"
                  class="mr-3 h-5 w-5 shrink-0 rounded-sm"
                  height="128"
                  width="128"
                />

                {{ service.title }}
              </button>
            </HeadlessMenuItem>
          </div>

          <!--General services -->
          <div class="py-1">
            <HeadlessMenuItem
              v-for="service in imageRelatedServiceOptions"
              v-slot="{ active }"
            >
              <button
                :class="[active ? 'bg-base-0/20 text-base-content-highlight' : 'text-base-content']"
                class="group ui-disabled:cursor-not-allowed ui-disabled:opacity-50 flex w-full items-center px-4 py-2 text-sm"
                type="button"
                @click="openSourceFinder(service.link)"
              >
                <img
                  :src="`https://icons.duckduckgo.com/ip2/${getHostnameFromUrl(service.link)}.ico`"
                  alt="Favicon"
                  class="mr-3 h-5 w-5 shrink-0 rounded-sm"
                  height="128"
                  width="128"
                />

                {{ service.title }}
              </button>
            </HeadlessMenuItem>
          </div>
          </HeadlessMenuItems>
        </Transition>
      </Teleport>
  </HeadlessMenu>
</template>
