<script lang="ts" setup>
  import Tag from '~/assets/js/tag.dto'
  import { Cog6ToothIcon, PlusIcon, TagIcon } from '@heroicons/vue/24/outline'
  import { TagCollection } from '~/assets/js/tagCollection.dto'

  const props = defineProps<{
    selectedTags: Tag[]
  }>()

  const emit = defineEmits<{
    updateSelectedTags: [selectedTags: Tag[]]
  }>()

  const localePath = useLocalePath()
  const { isPremium } = useUserData()
  const { t } = useI18n()
  const { toast } = useLazyToast()

  const { tagCollections } = useTagCollections()
  const { open: promptPremium, currentIndex } = usePremiumDialog()

  function setTagCollectionAsSelected(tagCollection: TagCollection) {
    if (!isPremium.value) {
      currentIndex.value = 6
      promptPremium.value = true
      return
    }

    const selectedTags = tagCollection.tags.map((tagName) => new Tag({ name: tagName }))

    emit('updateSelectedTags', selectedTags)
  }

  function createTagCollectionFromSelectedTags() {
    const selectedTags = props.selectedTags

    if (selectedTags.length === 0) {
      toast.error(t('toasts.selectAtLeastOneTag'))
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

    const tagCollection = new TagCollection({
      name: trimmedName,
      tags: selectedTags.map((tag) => tag.name)
    })

    tagCollections.value.push(tagCollection)
  }
</script>

<template>
  <!-- TODO: Review padding on desktop -->

  <nav class="relative flex flex-col gap-6">
    <header>
      <HeadlessDialogTitle
        as="h3"
        class="text-lg leading-10 font-medium text-base-content-highlight"
      >
        {{ $t('pages.premium.tagCollections') }}
      </HeadlessDialogTitle>

      <h4 class="text-sm">{{ $t('common.tagCollectionsDescription') }}</h4>
    </header>

    <div class="absolute top-0.5 right-0">
      <NuxtLink
        class="inline-flex w-full items-center gap-x-1.5 rounded-md p-1 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
        :to="localePath('/premium/tag-collections')"
      >
        <span class="sr-only"> {{ $t('common.manageTagCollections') }} </span>

        <Cog6ToothIcon
          aria-hidden="true"
          class="h-6 w-6"
        />
      </NuxtLink>
    </div>

    <!-- Body -->
    <section class="flex-auto overflow-y-auto">
      <ol class="space-y-4 p-1">
        <!-- -->

        <li
          v-for="tagCollection in tagCollections"
          :key="tagCollection.name"
        >
          <!-- -->

          <button
            class="inline-flex w-full items-center justify-between rounded-full px-4 py-1 ring-1 ring-base-0/20 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
            type="button"
            @click="setTagCollectionAsSelected(tagCollection)"
          >
            <span class="sr-only">{{ $t('common.selectTag') }}</span>

            <span>{{ tagCollection.name }}</span>

            <div class="flex items-center justify-center gap-x-1.5">
              <span>
                {{ tagCollection.tags.length }}
                <span class="sr-only">{{
                  $t('pages.premium.tagCollectionsPage.tagsInCollection', tagCollection.tags.length)
                }}</span>
              </span>

              <TagIcon
                aria-hidden="true"
                class="h-5 w-5"
              />
            </div>
          </button>
        </li>

        <!-- Create from current selected tags -->
        <!-- TODO: Improve design and cohesion -->
        <li>
          <button
            class="inline-flex w-full items-center justify-between rounded-full px-4 py-1 ring-1 ring-base-0/20 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
            type="button"
            @click="createTagCollectionFromSelectedTags"
          >
            <span class="whitespace-nowrap">{{ $t('common.createFromCurrentTags') }}</span>

            <PlusIcon
              aria-hidden="true"
              class="h-5 w-5"
            />
          </button>
        </li>
      </ol>
    </section>
  </nav>
</template>
