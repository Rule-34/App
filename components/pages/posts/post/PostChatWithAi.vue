<script lang="ts" setup>
  import { ChatBubbleLeftEllipsisIcon } from '@heroicons/vue/24/outline'
  import { useFloating, offset, flip, shift } from '@floating-ui/vue'
  import { useChatWithAiReferral } from '~/composables/useAdvertisements'
  import useAppStatistics from '~/composables/useAppStatistics'
  import type { IPost } from '~/assets/js/post.dto'

  const props = defineProps<{
    tags: IPost['tags']
  }>()

  const { chatWithAiReferralTemplate } = useChatWithAiReferral()
  const { tutorialChatWithAi } = useAppStatistics()

  const referenceEl = ref<HTMLElement>()
  const floatingEl = ref<HTMLElement>()

  const { floatingStyles } = useFloating(referenceEl, floatingEl, {
    placement: 'bottom-start',
    middleware: [offset(6), flip(), shift()]
  })

  const tagCandidates = computed(() => {
    if (props.tags.character.length > 0) {
      return props.tags.character
    }

    if (props.tags.copyright.length > 0) {
      return props.tags.copyright
    }

    return Object.values(props.tags).flat()
  })

  const normalizedTags = computed(() => {
    const uniqueTags = new Set<string>()
    for (const tag of tagCandidates.value) {
      uniqueTags.add(tag)
    }

    return Array.from(uniqueTags)
  })

  function formatTagForQuery(tag: string) {
    return tag.replaceAll('_', ' ')
  }

  function formatTagForDisplay(tag: string) {
    const normalized = formatTagForQuery(tag)

    return normalized
      .split(/(\W+)/)
      .map((segment) => {
        if (!segment || /\W+/.test(segment)) {
          return segment
        }

        const lower = segment.toLowerCase()
        return lower.charAt(0).toUpperCase() + lower.slice(1)
      })
      .join('')
  }

  function buildReferralUrl(tag: string) {
    const query = formatTagForQuery(tag)
    return chatWithAiReferralTemplate.value.replace('{query}', encodeURIComponent(query))
  }

  function onChatMenuOpen() {
    if (tutorialChatWithAi.value) {
      return
    }

    tutorialChatWithAi.value = true
  }
</script>

<template>
  <HeadlessMenu
    as="div"
    class="relative inline-block text-left"
  >
    <HeadlessMenuButton
      ref="referenceEl"
      aria-label="Chat with AI"
      class="hover:hover-bg-util focus-visible:focus-outline-util group flex items-center rounded-md px-1.5 py-1"
      @click="onChatMenuOpen"
    >
      <ClientOnly>
        <ChatBubbleLeftEllipsisIcon
          aria-hidden="true"
          :class="[
            'group-hover:hover-text-util text-base-content h-5 w-5',
            !tutorialChatWithAi ? 'chat-with-ai-glow-icon' : ''
          ]"
        />
        <template #fallback>
          <ChatBubbleLeftEllipsisIcon
            aria-hidden="true"
            class="group-hover:hover-text-util text-base-content h-5 w-5"
          />
        </template>
      </ClientOnly>
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
          class="divide-base-0/20 bg-base-1000 ring-base-0/20 z-50 w-56 divide-y rounded-md ring-1 focus:outline-hidden"
        >
          <div class="text-base-content-highlight px-4 py-2 text-sm font-medium">
            Chat with AI
          </div>

          <div
            v-if="!normalizedTags.length"
            class="py-1"
          >
            <span class="block px-4 py-2 text-sm"> No tags available </span>
          </div>

          <div
            v-else
            class="py-1"
          >
            <HeadlessMenuItem
              v-for="tag in normalizedTags"
              :key="tag"
              v-slot="{ active }"
            >
              <NuxtLink
                :class="[active ? 'bg-base-0/20 text-base-content-highlight' : 'text-base-content']"
                :href="buildReferralUrl(tag)"
                class="group flex w-full items-center px-4 py-2 text-sm"
                target="_blank"
                @click="tutorialChatWithAi = true"
              >
                <span class="truncate">
                  {{ formatTagForDisplay(tag) }}
                </span>
              </NuxtLink>
            </HeadlessMenuItem>
          </div>
        </HeadlessMenuItems>
      </Transition>
    </Teleport>
  </HeadlessMenu>
</template>

<style scoped>
  .chat-with-ai-glow-icon {
    animation: chatWithAiIconGlow 2.6s ease-in-out infinite;
  }

  @keyframes chatWithAiIconGlow {
    0%,
    100% {
      color: rgba(56, 189, 248, 0.8);
      filter: drop-shadow(0 0 3px rgba(56, 189, 248, 0.25));
    }
    50% {
      color: rgba(167, 139, 250, 0.95);
      filter: drop-shadow(0 0 4px rgba(167, 139, 250, 0.4))
        drop-shadow(0 0 8px rgba(56, 189, 248, 0.25));
    }
  }
</style>
