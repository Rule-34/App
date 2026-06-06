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
  const isCreatingCollection = ref(false)
  const newCollectionName = ref('')
  const collectionNameInput = ref<HTMLInputElement | null>(null)

  // Keep naming, duplicate validation, and list presentation aligned with the search TagCollections component.
  function openPremiumPrompt() {
    currentIndex.value = premiumPromotionIndices.tagCollections
    promptPremium.value = true
  }

  async function startCreateCollection() {
    if (!isPremium.value) {
      openPremiumPrompt()
      return
    }

    isCreatingCollection.value = true
    newCollectionName.value = ''

    await nextTick()
    collectionNameInput.value?.focus()
  }

  function cancelCreateCollection() {
    isCreatingCollection.value = false
    newCollectionName.value = ''
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

    const nextTagCollections = tagCollections.value.map((tagCollection) => {
      if (tagCollection.name !== tagCollectionName) {
        return tagCollection
      }

      if (tagCollection.tags.includes(props.tagName)) {
        return tagCollection
      }

      return new TagCollection({
        name: tagCollection.name,
        tags: [...tagCollection.tags, props.tagName]
      })
    })

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

    const trimmedName = newCollectionName.value.trim()

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
      cancelCreateCollection()
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

    <div class="space-y-2 pt-2">
      <template v-if="isCreatingCollection">
        <label
          class="block text-sm font-medium text-base-content-highlight"
          for="tag-collection-name"
        >
          {{ $t('common.promptTagCollectionName') }}
        </label>

        <input
          id="tag-collection-name"
          ref="collectionNameInput"
          v-model="newCollectionName"
          :placeholder="$t('common.promptTagCollectionName')"
          class="block w-full rounded-md bg-base-900 px-3 py-2 text-base text-base-content ring-1 ring-base-0/20 placeholder:text-base-content/50 focus-visible:focus-outline-util"
          type="text"
          @keydown.enter.prevent="createTagCollectionFromTag"
          @keydown.esc.prevent="cancelCreateCollection"
        />

        <div class="flex gap-2">
          <button
            class="inline-flex flex-1 items-center justify-center rounded-md px-3 py-2 text-sm font-medium ring-1 ring-base-0/20 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
            type="button"
            @click="cancelCreateCollection"
          >
            {{ $t('common.close') }}
          </button>

          <button
            class="inline-flex flex-1 items-center justify-center rounded-md px-3 py-2 text-sm font-medium ring-1 ring-base-0/20 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
            type="button"
            @click="createTagCollectionFromTag"
          >
            {{ $t('pages.premium.tagCollectionsPage.createButton') }}
          </button>
        </div>
      </template>

      <button
        v-else
        class="inline-flex w-full items-center justify-between rounded-md px-3 py-2 text-left ring-1 ring-base-0/20 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
        type="button"
        @click="startCreateCollection"
      >
        <span>
          {{ $t('pages.premium.tagCollectionsPage.createCollection') }}
        </span>
      </button>
    </div>
  </nav>
</template>
