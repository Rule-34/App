<script lang="ts" setup>
  import {
    ArrowTopRightOnSquareIcon,
    MagnifyingGlassIcon,
    MinusIcon,
    NoSymbolIcon,
    PlusIcon,
    ShieldExclamationIcon
  } from '@heroicons/vue/24/outline'
  import { toast } from 'vue-sonner'
  import type Tag from '~/assets/js/tag.dto'

  const props = defineProps<{
    tag: Tag
    selectedTags: Tag[]
  }>()

  const emit = defineEmits<{
    addTag: [tag: string]
    setTag: [tag: string]
    openTagInNewTab: [tag: string]
  }>()

  const { isPremium } = useUserData()
  const { customBlockList, selectedList } = useBlockLists()
  const { tutorialBlocklist } = useAppStatistics()

  function isTagInSelectedTags(tag: Tag): boolean {
    return props.selectedTags.some((selectedTag) => selectedTag.name === tag.name)
  }

  function isTagBlocked(tag: Tag): boolean {
    return customBlockList.value.includes(tag.name)
  }

  async function toggleBlockedTag(tag: Tag) {
    if (!isPremium.value) {
      const { open: promptPremium, currentIndex } = usePremiumDialog()
      currentIndex.value = 6
      promptPremium.value = true
      return
    }

    if (!tutorialBlocklist.value) {
      toast.info('Tag Blocklisted', {
        description: 'It will take effect after a new search',
        duration: 10000
      })
      tutorialBlocklist.value = true
    }

    if (isTagBlocked(tag)) {
      customBlockList.value = customBlockList.value.filter((t) => t !== tag.name)
    } else {
      customBlockList.value = [...customBlockList.value, tag.name]
    }
  }
</script>

<template>
  <HeadlessMenu
    as="div"
    class="relative inline-block text-left"
  >
    <!-- TODO: Fix placement to be auto -->
    <Float
      vue-transition
      :offset="6"
      enter="transition ease-out duration-100"
      enter-from="transform opacity-0 scale-95"
      enter-to="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leave-from="transform opacity-100 scale-100"
      leave-to="transform opacity-0 scale-95"
      placement="bottom-start"
      flip
      portal
      tailwindcss-origin-class
    >
      <HeadlessMenuButton
        :class="{
          'bg-primary-400/20 text-primary-400/90 ring-accent-400/20 hover:bg-primary-400/20': tag.type === 'artist',
          'bg-green-400/20 text-green-400/90 ring-green-400/20 hover:bg-green-400/20': tag.type === 'copyright',
          'bg-emerald-400/20 text-emerald-400/90 ring-emerald-400/20 hover:bg-emerald-400/20': tag.type === 'character',
          'hover:hover-bg-util': tag.type === 'general' || tag.type === 'meta',

          // Mark tag as selected
          'hover-bg-util hover-text-util ring-base-0/20!': selectedTags.some(
            (selectedTag) => selectedTag.name === tag.name
          )
        }"
        class="focus-visible:focus-outline-util hover:hover-text-util select-none items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ring-base-0/20"
      >
        {{ tag.name }}
      </HeadlessMenuButton>

      <HeadlessMenuItems
        class="divide-y divide-base-0/20 rounded-md bg-base-1000 ring-1 ring-base-0/20 focus:outline-hidden"
      >
        <!-- Add or Remove tag -->
        <div class="py-1">
          <HeadlessMenuItem v-slot="{ active }">
            <button
              :class="[active ? 'bg-base-0/20 text-base-content-highlight' : 'text-base-content']"
              class="group flex w-full items-center px-2.5 py-1 text-sm"
              type="button"
              @click="emit('addTag', props.tag.name)"
            >
              <component
                :is="isTagInSelectedTags(tag) ? MinusIcon : PlusIcon"
                class="mr-3 h-4 w-4 shrink-0 rounded-sm"
              />

              {{ isTagInSelectedTags(tag) ? 'Remove tag' : 'Add tag' }}
            </button>
          </HeadlessMenuItem>
        </div>

        <!-- Exclude tag -->
        <div class="py-1">
          <HeadlessMenuItem v-slot="{ active }">
            <button
              :class="[active ? 'bg-base-0/20 text-base-content-highlight' : 'text-base-content']"
              class="group flex w-full items-center px-2.5 py-1 text-sm"
              type="button"
              @click="emit('addTag', '-' + props.tag.name)"
            >
              <NoSymbolIcon class="mr-3 h-4 w-4 shrink-0 rounded-sm" />

              Exclude tag
            </button>
          </HeadlessMenuItem>
        </div>

        <!-- Set tag -->
        <div class="py-1">
          <HeadlessMenuItem v-slot="{ active }">
            <button
              :class="[active ? 'bg-base-0/20 text-base-content-highlight' : 'text-base-content']"
              class="group flex w-full items-center px-2.5 py-1 text-sm"
              type="button"
              @click="emit('setTag', props.tag.name)"
            >
              <MagnifyingGlassIcon class="mr-3 h-4 w-4 shrink-0 rounded-sm" />

              Set tag
            </button>
          </HeadlessMenuItem>
        </div>

        <!-- Blocklist Management (Premium only) -->
        <div class="py-1">
          <HeadlessMenuItem v-slot="{ active }">
            <button
              :class="[active ? 'bg-base-0/20 text-base-content-highlight' : 'text-base-content']"
              class="group flex w-full items-center px-2.5 py-1 text-sm"
              type="button"
              @click="toggleBlockedTag(tag)"
            >
              <ShieldExclamationIcon class="mr-3 h-4 w-4 shrink-0 rounded-sm" />
              {{ isTagBlocked(tag) ? 'Remove from blocklist' : 'Add to blocklist' }}
            </button>
          </HeadlessMenuItem>
        </div>

        <!-- Open in new tab -->
        <div class="py-1">
          <HeadlessMenuItem v-slot="{ active }">
            <button
              :class="[active ? 'bg-base-0/20 text-base-content-highlight' : 'text-base-content']"
              class="group flex w-full items-center px-2.5 py-1 text-sm"
              type="button"
              @click="emit('openTagInNewTab', props.tag.name)"
            >
              <ArrowTopRightOnSquareIcon class="mr-3 h-4 w-4 shrink-0 rounded-sm" />

              Open in new tab
            </button>
          </HeadlessMenuItem>
        </div>
      </HeadlessMenuItems>
    </Float>
  </HeadlessMenu>
</template>
