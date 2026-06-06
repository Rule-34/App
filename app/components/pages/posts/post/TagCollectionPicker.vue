<script lang="ts" setup>
  import { TagCollection } from '~/assets/js/tagCollection.dto'
  import { premiumPromotionIndices } from '~/composables/usePremiumDialog'

  const props = defineProps<{
    tagName: string
  }>()

  const emit = defineEmits<{
    close: []
  }>()

  const { t } = useI18n()
  const { toast } = useLazyToast()
  const { isPremium } = useUserData()
  const { tagCollections } = useTagCollections()
  const { setTagCollections } = usePremiumCloudSync()
  const { open: promptPremium, currentIndex } = usePremiumDialog()

  // Keep naming, duplicate validation, and list presentation aligned with the search TagCollections component.
  function openPremiumPrompt() {
    currentIndex.value = premiumPromotionIndices.tagCollections
    promptPremium.value = true
  }

  function showCollectionSavedToast() {
    toast.info(t('toasts.tagAddedToCollection'), {
      description: t('toasts.tagAddedToCollectionDescription'),
      duration: 10000
    })
  }

  async function addTagToCollection(tagCollectionName: string) {
    if (!isPremium.value) {
      openPremiumPrompt()
      return
    }

    let wasAdded = false
    const nextTagCollections = tagCollections.value.map((tagCollection) => {
      if (tagCollection.name !== tagCollectionName) {
        return tagCollection
      }

      if (tagCollection.tags.includes(props.tagName)) {
        return tagCollection
      }

      wasAdded = true
      return new TagCollection({
        name: tagCollection.name,
        tags: [...tagCollection.tags, props.tagName]
      })
    })

    if (!wasAdded) {
      emit('close')
      return
    }

    if (await setTagCollections(nextTagCollections)) {
      showCollectionSavedToast()
      emit('close')
    }
  }

  async function createTagCollectionFromTag() {
    if (!isPremium.value) {
      openPremiumPrompt()
      return
    }

    const name = prompt(t('common.promptTagCollectionName'))
    const trimmedName = name?.trim()

    if (!trimmedName) {
      return
    }

    if (tagCollections.value.some((tagCollection) => tagCollection.name === trimmedName)) {
      toast.error(t('toasts.tagCollectionExists'))
      return
    }

    const nextTagCollections = [
      ...tagCollections.value,
      new TagCollection({
        name: trimmedName,
        tags: [props.tagName]
      })
    ]

    if (await setTagCollections(nextTagCollections)) {
      showCollectionSavedToast()
      emit('close')
    }
  }
</script>

<template>
  <nav class="flex flex-col gap-4 px-4 py-4">
    <header class="space-y-1">
      <h3 class="text-lg leading-7 font-semibold text-base-content-highlight">
        {{ $t('tags.addToCollection') }}
      </h3>

      <p class="text-sm text-base-content/80">
        {{ $t('common.tagCollectionsDescription') }}
      </p>
    </header>

    <section class="space-y-2">
      <button
        v-for="tagCollection in tagCollections"
        :key="tagCollection.name"
        class="inline-flex w-full items-center justify-between rounded-md px-3 py-2 text-left ring-1 ring-base-0/20 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
        type="button"
        @click="addTagToCollection(tagCollection.name)"
      >
        <span class="truncate">
          {{ tagCollection.name }}
        </span>

        <span class="ml-3 shrink-0 text-sm text-base-content/70 tabular-nums">
          {{ tagCollection.tags.length }}
        </span>
      </button>
    </section>

    <button
      class="inline-flex w-full items-center justify-between rounded-md px-3 py-2 text-left ring-1 ring-base-0/20 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
      type="button"
      @click="createTagCollectionFromTag"
    >
      <span>
        {{ $t('pages.premium.tagCollectionsPage.createCollection') }}
      </span>
    </button>
  </nav>
</template>
