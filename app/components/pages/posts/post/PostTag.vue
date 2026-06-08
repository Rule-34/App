<script lang="ts" setup>
  import {
    ArrowTopRightOnSquareIcon,
    DocumentDuplicateIcon,
    MagnifyingGlassIcon,
    MinusIcon,
    NoSymbolIcon,
    FolderPlusIcon,
    PlusIcon,
    ShieldExclamationIcon
  } from '@heroicons/vue/24/outline'
  import { useClipboard } from '@vueuse/core'
  import { flip, offset, shift, useFloating } from '@floating-ui/vue'
  import type Tag from '~/assets/js/tag.dto'
  import { blockListOptions } from '~/composables/useBlockLists'

  const props = defineProps<{
    tag: Tag
    selectedTags: Tag[]
  }>()

  const emit = defineEmits<{
    addTag: [tag: string]
    addToCollection: [tag: string]
    blocklistPremiumRequired: []
    setTag: [tag: string]
    openTagInNewTab: [tag: string]
  }>()

  const { isPremium } = useUserData()
  const { customBlockList, selectedList } = useBlockLists()
  const { setCustomBlockList } = usePremiumCloudSync()
  const { copy } = useClipboard()
  const { t } = useI18n()
  const { toast } = useLazyToast()

  const referenceEl = ref<HTMLElement>()
  const floatingEl = ref<HTMLElement>()

  const { floatingStyles } = useFloating(referenceEl, floatingEl, {
    placement: 'bottom-start',
    middleware: [offset(6), flip(), shift()]
  })

  function isTagInSelectedTags(tag: Tag): boolean {
    return props.selectedTags.some((selectedTag) => selectedTag.name === tag.name)
  }

  function isTagBlocked(tag: Tag): boolean {
    return customBlockList.value.includes(tag.name)
  }

  async function copyTag() {
    await copy(props.tag.name)

    toast.success(t('toasts.tagCopiedToClipboard'))
  }

  async function toggleBlockedTag(tag: Tag) {
    if (!isPremium.value) {
      emit('blocklistPremiumRequired')
      return
    }

    if (isTagBlocked(tag)) {
      const saved = await setCustomBlockList(customBlockList.value.filter((blockedTag) => blockedTag !== tag.name))

      if (!saved) {
        return
      }

      return
    }

    const saved = await setCustomBlockList([...customBlockList.value, tag.name])

    if (!saved) {
      return
    }

    selectedList.value = blockListOptions.Custom

    toast.info(t('toasts.tagAddedToBlocklist'), {
      description: t('toasts.tagAddedToBlocklistDescription'),
      duration: 10000 // 10 seconds
    })
  }

  function addToCollection(tag: Tag) {
    emit('addToCollection', tag.name)
  }
</script>

<template>
  <HeadlessMenu
    as="div"
    class="relative inline-block text-left"
  >
    <HeadlessMenuButton
      ref="referenceEl"
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
      class="items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-base-0/20 select-none ring-inset hover:hover-text-util focus-visible:focus-outline-util"
    >
      {{ tag.name }}
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
          class="z-50 divide-y divide-base-0/20 rounded-md bg-base-1000 ring-1 ring-base-0/20 focus:outline-hidden"
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
                  aria-hidden="true"
                  class="mr-3 h-4 w-4 shrink-0 rounded-sm"
                />

                {{ isTagInSelectedTags(tag) ? $t('tags.removeTag') : $t('tags.addTag') }}
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
                <NoSymbolIcon
                  aria-hidden="true"
                  class="mr-3 h-4 w-4 shrink-0 rounded-sm"
                />

                {{ $t('tags.excludeTag') }}
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
                <MagnifyingGlassIcon
                  aria-hidden="true"
                  class="mr-3 h-4 w-4 shrink-0 rounded-sm"
                />

                {{ $t('tags.setTag') }}
              </button>
            </HeadlessMenuItem>
          </div>

          <!-- Copy tag -->
          <div class="py-1">
            <HeadlessMenuItem v-slot="{ active }">
              <button
                :class="[active ? 'bg-base-0/20 text-base-content-highlight' : 'text-base-content']"
                class="group flex w-full items-center px-2.5 py-1 text-sm"
                type="button"
                @click="copyTag"
              >
                <DocumentDuplicateIcon
                  aria-hidden="true"
                  class="mr-3 h-4 w-4 shrink-0 rounded-sm"
                />

                {{ $t('tags.copyTag') }}
              </button>
            </HeadlessMenuItem>
          </div>

          <!-- Add to collection -->
          <div class="py-1">
            <HeadlessMenuItem v-slot="{ active }">
              <button
                :class="[active ? 'bg-base-0/20 text-base-content-highlight' : 'text-base-content']"
                class="group flex w-full items-center px-2.5 py-1 text-sm"
                type="button"
                @click="addToCollection(tag)"
              >
                <FolderPlusIcon
                  aria-hidden="true"
                  class="mr-3 h-4 w-4 shrink-0 rounded-sm"
                />

                {{ $t('tags.addToCollection') }}
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
                <ShieldExclamationIcon
                  aria-hidden="true"
                  class="mr-3 h-4 w-4 shrink-0 rounded-sm"
                />
                {{ isTagBlocked(tag) ? $t('tags.removeFromBlocklist') : $t('tags.addToBlocklist') }}
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
                <ArrowTopRightOnSquareIcon
                  aria-hidden="true"
                  class="mr-3 h-4 w-4 shrink-0 rounded-sm"
                />

                {{ $t('tags.openInNewTab') }}
              </button>
            </HeadlessMenuItem>
          </div>
        </HeadlessMenuItems>
      </Transition>
    </Teleport>
  </HeadlessMenu>
</template>
