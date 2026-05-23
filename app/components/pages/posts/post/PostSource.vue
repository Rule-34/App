<script lang="ts" setup>
  import { LinkIcon } from '@heroicons/vue/24/outline'
  import { useFloating, offset, flip, shift } from '@floating-ui/vue'
  import type { IPost } from '~/assets/js/post.dto'

  const props = defineProps<{
    postSources: IPost['sources']

    postFileUrl: string
  }>()

  const { t } = useI18n()
  const { toast } = useLazyToast()
  const { isPremium } = useUserData()
  const { tutorialPostSource } = useAppStatistics()

  const referenceEl = ref<HTMLElement>()
  const floatingEl = ref<HTMLElement>()

  const { floatingStyles } = useFloating(referenceEl, floatingEl, {
    placement: 'bottom-start',
    middleware: [offset(6), flip(), shift()]
  })

  const imageAnimeRelatedServiceOptions = computed(() => [
    {
      serviceName: 'SauceNAO',
      action: 'find' as const,
      link: `https://saucenao.com/search.php?url=${encodeURIComponent(props.postFileUrl)}`
    },
    {
      serviceName: 'ASCII2D',
      action: 'find' as const,
      link: `https://ascii2d.net/search/url/${encodeURIComponent(props.postFileUrl)}`
    },
    {
      serviceName: 'IQDB',
      action: 'find' as const,
      link: `https://iqdb.org/?url=${encodeURIComponent(props.postFileUrl)}`
    }
  ])

  const imageRelatedServiceOptions = computed(() => [
    {
      serviceName: 'Google',
      action: 'find' as const,
      link: `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(props.postFileUrl)}`
    },
    // TODO: Fix Yandex
    {
      serviceName: 'Yandex',
      action: 'find' as const,
      link: `https://yandex.com/images/search?url=${encodeURIComponent(props.postFileUrl)}`
    },
    {
      serviceName: 'Bing',
      action: 'find' as const,
      link: `https://www.bing.com/images/searchbyimage?cbir=sbi&imgurl=${encodeURIComponent(props.postFileUrl)}`
    },
    {
      serviceName: 'TinEye',
      action: 'find' as const,
      link: `https://tineye.com/search/?url=${encodeURIComponent(props.postFileUrl)}`
    },
    {
      serviceName: 'ImgOps',
      action: 'edit' as const,
      link: `https://imgops.com/${props.postFileUrl.replace(/^https?:\/\//, '')}`
    }
  ])

  function getServiceTitle(action: 'find' | 'edit', serviceName: string) {
    return t(action === 'edit' ? 'source.editWithService' : 'source.findWithService', {
      service: serviceName
    })
  }

  function getHostnameFromUrl(source: string) {
    return URL.parse(source)?.hostname ?? source
  }

  function canParseUrl(source: string) {
    return URL.parse(source) !== null
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

    window.open(url, '_blank', 'noopener,noreferrer')
  }

  function onMenuOpen() {
    if (tutorialPostSource.value) {
      return
    }

    toast.info(t('toasts.postSource'), {
      description: t('toasts.postSourceDescription'),
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
      :aria-label="t('common.openPostSourceOptions')"
      class="group flex items-center rounded-md px-1.5 py-1 hover:hover-bg-util focus-visible:focus-outline-util"
      @click="onMenuOpen"
    >
      <LinkIcon
        aria-hidden="true"
        class="h-5 w-5 text-base-content group-hover:hover-text-util"
      />
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
          class="z-50 w-56 divide-y divide-base-0/20 rounded-md bg-base-1000 ring-1 ring-base-0/20 focus:outline-hidden"
        >
          <div class="px-4 py-2 text-sm font-medium text-base-content-highlight">{{ t('source.postSource') }}</div>

          <!-- No source found -->
          <div
            v-if="!postSources.length"
            class="py-1"
          >
            <span class="block px-4 py-2 text-sm"> {{ t('source.noSourceFound') }} </span>
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
              <template v-if="canParseUrl(source)">
                <NuxtLink
                  :class="[active ? 'bg-base-0/20 text-base-content-highlight' : 'text-base-content']"
                  :href="source"
                  class="group flex w-full items-center px-4 py-2 text-sm"
                  target="_blank"
                >
                  <img
                    :alt="t('common.favicon')"
                    :src="useFaviconUrl(source)"
                    class="mr-3 h-5 w-5 shrink-0 rounded-sm"
                    height="64"
                    width="64"
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
              :key="service.serviceName"
              v-slot="{ active }"
            >
              <button
                :class="[active ? 'bg-base-0/20 text-base-content-highlight' : 'text-base-content']"
                class="group flex w-full items-center px-4 py-2 text-sm ui-disabled:cursor-not-allowed ui-disabled:opacity-50"
                type="button"
                @click="openSourceFinder(service.link)"
              >
                <img
                  :alt="t('common.favicon')"
                  :src="useFaviconUrl(service.link)"
                  class="mr-3 h-5 w-5 shrink-0 rounded-sm"
                  height="64"
                  width="64"
                />

                {{ getServiceTitle(service.action, service.serviceName) }}
              </button>
            </HeadlessMenuItem>
          </div>

          <!--General services -->
          <div class="py-1">
            <HeadlessMenuItem
              v-for="service in imageRelatedServiceOptions"
              :key="service.serviceName"
              v-slot="{ active }"
            >
              <button
                :class="[active ? 'bg-base-0/20 text-base-content-highlight' : 'text-base-content']"
                class="group flex w-full items-center px-4 py-2 text-sm ui-disabled:cursor-not-allowed ui-disabled:opacity-50"
                type="button"
                @click="openSourceFinder(service.link)"
              >
                <img
                  :alt="t('common.favicon')"
                  :src="useFaviconUrl(service.link)"
                  class="mr-3 h-5 w-5 shrink-0 rounded-sm"
                  height="64"
                  width="64"
                />

                {{ getServiceTitle(service.action, service.serviceName) }}
              </button>
            </HeadlessMenuItem>
          </div>
        </HeadlessMenuItems>
      </Transition>
    </Teleport>
  </HeadlessMenu>
</template>
