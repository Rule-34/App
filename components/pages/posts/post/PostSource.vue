<script lang="ts" setup>
  import { LinkIcon } from '@heroicons/vue/24/outline'
  import { toast } from 'vue-sonner'
  import type { IPost } from '~/assets/js/post'

  const props = defineProps<{
    postSources: IPost['sources']

    postFileUrl: string
  }>()

  const { isPremium } = useUserData()
  const { tutorialPostSource } = useAppStatistics()

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
      toast.info('Premium feature', {
        description: 'Find the source of this post with SauceNAO, IQDB, Google, Yandex, Bing, and many more!',
        action: {
          label: 'Subscribe',
          onClick: () => navigateTo('/premium')
        }
      })
      return
    }

    window.open(url, '_blank')
  }

  function onMenuOpen() {
    if (tutorialPostSource.value) {
      return
    }

    toast.info('Post Source', {
      description: 'Find the source (artist) of posts with SauceNAO, IQDB, Google, Yandex, Bing, and many more!',
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
    <Float
      :offset="6"
      enter="transition ease-out duration-100"
      enter-from="transform opacity-0 scale-95"
      enter-to="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leave-from="transform opacity-100 scale-100"
      leave-to="transform opacity-0 scale-95"
      placement="bottom-start"
      portal
      tailwindcss-origin-class
    >
      <HeadlessMenuButton
        class="hover:hover-bg-util focus-visible:focus-outline-util group flex items-center rounded-md px-1.5 py-1"
        @click="onMenuOpen"
      >
        <span class="sr-only"> Open post source options </span>

        <LinkIcon class="group-hover:hover-text-util h-5 w-5 text-base-content" />
      </HeadlessMenuButton>

      <HeadlessMenuItems
        class="w-56 divide-y divide-base-0/20 rounded-md bg-base-1000 ring-1 ring-base-0/20 focus:outline-none"
      >
        <div
          v-if="postSources.length"
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
                  class="mr-3 h-5 w-5 flex-shrink-0 rounded"
                  height="128"
                  loading="eager"
                  width="128"
                />

                <span class="truncate">
                  {{ getFriendlyStringFromHostname(getHostnameFromUrl(source)) }}
                </span>
              </NuxtLink>
            </template>

            <template v-else>
              <span class="block break-words px-4 py-2 text-sm">
                {{ source }}
              </span>
            </template>
          </HeadlessMenuItem>
        </div>

        <!-- Anime services -->
        <div class="py-1">
          <!-- SauceNAO -->
          <HeadlessMenuItem
            v-for="service in imageAnimeRelatedServiceOptions"
            v-slot="{ active }"
          >
            <button
              :class="[active ? 'bg-base-0/20 text-base-content-highlight' : 'text-base-content']"
              class="group flex w-full items-center px-4 py-2 text-sm"
              type="button"
              @click="openSourceFinder(service.link)"
            >
              <img
                :src="`https://icons.duckduckgo.com/ip2/${getHostnameFromUrl(service.link)}.ico`"
                alt="Favicon"
                class="mr-3 h-5 w-5 flex-shrink-0 rounded"
                height="128"
                loading="eager"
                width="128"
              />

              {{ service.title }}
            </button>
          </HeadlessMenuItem>
        </div>

        <!--General services -->
        <div class="py-1">
          <!-- SauceNAO -->
          <HeadlessMenuItem
            v-for="service in imageRelatedServiceOptions"
            v-slot="{ active }"
          >
            <button
              :class="[active ? 'bg-base-0/20 text-base-content-highlight' : 'text-base-content']"
              class="group flex w-full items-center px-4 py-2 text-sm"
              type="button"
              @click="openSourceFinder(service.link)"
            >
              <img
                :src="`https://icons.duckduckgo.com/ip2/${getHostnameFromUrl(service.link)}.ico`"
                alt="Favicon"
                class="mr-3 h-5 w-5 flex-shrink-0 rounded"
                height="128"
                loading="eager"
                width="128"
              />

              {{ service.title }}
            </button>
          </HeadlessMenuItem>
        </div>
      </HeadlessMenuItems>
    </Float>
  </HeadlessMenu>
</template>
