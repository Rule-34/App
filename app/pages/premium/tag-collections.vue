<script lang="ts" setup>
  import { ArrowUturnLeftIcon, Bars2Icon, PencilIcon, PlusIcon } from '@heroicons/vue/20/solid'
  import { vAutoAnimate } from '@formkit/auto-animate/vue'
  import { useSortable } from '@vueuse/integrations/useSortable'
  import { moveArrayItem } from '~/assets/js/AsyncSaveQueue'
  import type { ComputedRef, Ref } from 'vue'
  import { TagCollection } from '~/assets/js/tagCollection.dto'
  import Slideover from '~/components/layout/Slideover.vue'

  const { t } = useI18n()
  const { toast } = useLazyToast()
  const localePath = useLocalePath()
  const { tagCollections } = useTagCollections()
  const { setTagCollections, resetTagCollectionsCloud } = usePremiumCloudSync()

  const sortableElement = shallowRef<HTMLElement | null>(null)

  type SortableUpdateEvent = {
    oldIndex?: number
    newIndex?: number
  }

  useSortable(sortableElement, tagCollections, {
    handle: '.handle',
    animation: 150,

    onUpdate: (e: SortableUpdateEvent) => {
      const { oldIndex, newIndex } = e

      if (oldIndex == null || newIndex == null) {
        return
      }

      const nextTagCollections = moveArrayItem(tagCollections.value, oldIndex, newIndex)
      void setTagCollections(nextTagCollections)
    }
  })

  const dialogOpen = shallowRef(false)

  type dialogModes = 'create' | 'update'

  const dialogEditIndex: Ref<number | null> = shallowRef(null)
  const dialogMode: ComputedRef<dialogModes> = computed(() => {
    if (dialogEditIndex.value !== null) {
      return 'update'
    }

    return 'create'
  })

  type TagCollectionForm = {
    name: string
    tags: string
  }

  const currentItem: Ref<TagCollectionForm> = shallowRef({
    name: '',
    tags: ''
  })

  async function resetTagCollectionsToDefault() {
    if (!confirm(t('common.confirmResetTagCollections'))) {
      return
    }

    await resetTagCollectionsCloud()
  }

  function openCreateDialog() {
    currentItem.value = {
      name: '',
      tags: ''
    }

    dialogEditIndex.value = null
    dialogOpen.value = true
  }

  function openEditDialog(index: number) {
    const tagCollection = tagCollections.value[index]

    if (!tagCollection) {
      return
    }

    // TODO: Design a better way to encode and decode tags
    currentItem.value = {
      name: tagCollection.name,
      tags: tagCollection.tags.join('\n')
    }

    dialogEditIndex.value = index
    dialogOpen.value = true
  }

  async function onFormSubmit() {
    if (dialogMode.value === 'create') {
      await createItem()
    } else {
      await editItem()
    }
  }

  async function createItem() {
    // Validations
    if (!currentItem.value.name || !currentItem.value.tags.length) {
      toast.error(t('toasts.fillOutAllFields'))
      return
    }

    if (tagCollections.value.find((tagCollection) => tagCollection.name === currentItem.value.name)) {
      toast.error(t('toasts.tagCollectionExists'))
      return
    }

    // TODO: Design a better way to encode and decode tags
    const nextTagCollections = [
      ...tagCollections.value,
      new TagCollection({
        name: currentItem.value.name,
        tags: tagsStringToArray(currentItem.value.tags)
      })
    ]

    if (await setTagCollections(nextTagCollections)) {
      dialogOpen.value = false
    }
  }

  async function editItem() {
    // Validations
    if (!currentItem.value.name || !currentItem.value.tags.length) {
      toast.error(t('toasts.fillOutAllFields'))
      return
    }

    if (
      tagCollections.value.some(
        (tagCollection, index) => index !== dialogEditIndex.value && tagCollection.name === currentItem.value.name
      )
    ) {
      toast.error(t('toasts.tagCollectionExists'))
      return
    }

    // TODO: Design a better way to encode and decode tags
    const nextTagCollections = [...tagCollections.value]
    nextTagCollections[dialogEditIndex.value!] = new TagCollection({
      name: currentItem.value.name,
      tags: tagsStringToArray(currentItem.value.tags)
    })

    if (await setTagCollections(nextTagCollections)) {
      dialogOpen.value = false
    }
  }

  function tagsStringToArray(tagsString: string) {
    let tagsArray = tagsString
      .split('\n')
      .map((tag) => tag.trim())
      .filter((tag) => tag)

    // Deduplicate
    tagsArray = [...new Set(tagsArray)]

    return tagsArray
  }

  async function deleteItem() {
    const nextTagCollections = tagCollections.value.filter((_, index) => index !== dialogEditIndex.value)

    if (await setTagCollections(nextTagCollections)) {
      dialogOpen.value = false
    }
  }

  useSeoMeta({
    title: computed(() => t('pages.premium.tagCollectionsPage.seoTitle'))
  })

  useSchemaOrg([
    defineBreadcrumb({
      itemListElement: [
        { name: t('nav.home'), item: localePath('/') },
        { name: t('pages.premium.landingPage.seoTitle'), item: localePath('/premium') },
        { name: t('pages.premium.tagCollectionsPage.seoTitle'), item: localePath('/premium/tag-collections') }
      ]
    })
  ])

  definePageMeta({
    middleware: ['auth']
  })
</script>

<template>
  <main class="container mx-auto flex max-w-3xl flex-1 flex-col px-4 py-4 sm:px-6 lg:px-8">
    <PageHeader>
      <template #title>{{ $t('pages.premium.tagCollectionsPage.pageTitle') }}</template>
      <template #text>{{ $t('pages.premium.tagCollectionsPage.pageDescription') }}</template>
    </PageHeader>

    <!-- List -->
    <section class="mx-2 mt-4 flex-auto">
      <ol
        ref="sortableElement"
        v-auto-animate
        class="space-y-4"
      >
        <li
          v-for="(tagCollection, index) in tagCollections"
          :key="tagCollection.name"
          class="flex w-full items-center gap-2"
        >
          <!-- Handle -->
          <div class="handle mr-2 cursor-move">
            <span class="sr-only">{{ $t('pages.premium.tagCollectionsPage.dragToReorder') }}</span>

            <Bars2Icon
              aria-hidden="true"
              class="h-4 w-4 text-base-content group-hover:text-base-content-hover"
            />
          </div>

          <!-- Tag Length -->
          <div
            class="flex h-5 w-8 shrink-0 items-center justify-center overflow-x-hidden rounded-full bg-base-0/20 px-2 text-sm tabular-nums"
          >
            {{ tagCollection.tags.length }}

            <span class="sr-only">
              {{ $t('pages.premium.tagCollectionsPage.tagsInCollection', tagCollection.tags.length) }}
            </span>
          </div>

          <!-- Name -->
          <span class="">
            {{ tagCollection.name }}
          </span>

          <!-- Take space -->
          <div class="flex-1" />

          <!-- Actions -->
          <div class="flex gap-2">
            <!-- Edit -->
            <button
              :aria-label="t('common.edit')"
              class="inline-flex items-center justify-center rounded-md p-2 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
              type="button"
              @click="openEditDialog(index)"
            >
              <PencilIcon
                aria-hidden="true"
                class="h-4 w-4"
              />
            </button>
          </div>
        </li>
      </ol>
    </section>

    <!-- Actions -->
    <section class="mt-4 flex items-center justify-between gap-2">
      <!-- Reset to default -->
      <button
        class="inline-flex items-center justify-center gap-2 rounded-md px-2 py-1 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
        type="button"
        @click="resetTagCollectionsToDefault"
      >
        <ArrowUturnLeftIcon
          aria-hidden="true"
          class="mr-2 h-4 w-4"
        />

        {{ $t('pages.premium.tagCollectionsPage.resetToDefault') }}
      </button>

      <!-- Add -->
      <button
        class="inline-flex items-center justify-center gap-2 rounded-md px-2 py-1 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
        type="button"
        @click="openCreateDialog"
      >
        {{ $t('pages.premium.tagCollectionsPage.createCollection') }}

        <PlusIcon
          aria-hidden="true"
          class="mr-2 ml-2 h-4 w-4"
        />
      </button>
    </section>
  </main>

  <!-- Dialog -->
  <Slideover
    :is-open="dialogOpen"
    @close="dialogOpen = false"
  >
    <template #title>{{
      dialogMode === 'create'
        ? $t('pages.premium.tagCollectionsPage.createTitle')
        : $t('pages.premium.tagCollectionsPage.editTitle')
    }}</template>

    <div class="divide-y divide-gray-200 px-4 sm:px-6">
      <!-- Form -->
      <form
        id="create-form"
        class="space-y-6 pt-6 pb-5"
        @submit.prevent="onFormSubmit"
      >
        <!-- Name -->
        <div>
          <label
            class="block leading-8 font-medium text-base-content-highlight"
            for="name"
          >
            {{ $t('pages.premium.tagCollectionsPage.nameLabel') }}
          </label>

          <input
            id="name"
            v-model="currentItem.name"
            class="w-full rounded-md border-base-0/20 bg-base-1000 px-2 py-1.5 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util sm:text-sm sm:leading-6"
            name="name"
            required
            type="text"
          />
        </div>

        <!-- Tags -->
        <div>
          <label
            class="block leading-8 font-medium text-base-content-highlight"
            for="tags"
          >
            {{ $t('pages.premium.tagCollectionsPage.tagsLabel') }}
          </label>

          <textarea
            id="tags"
            v-model="currentItem.tags"
            aria-describedby="tags-description"
            class="mt-2 block w-full rounded-md border-base-0/20 bg-base-1000 py-1.5 pr-10 pl-3 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util sm:text-sm sm:leading-6"
            name="tags"
            required
            rows="10"
          />

          <p
            id="tags-description"
            class="mt-2 text-sm"
          >
            {{ $t('pages.premium.tagCollectionsPage.oneTagPerLine') }}

            <br />

            {{ $t('pages.premium.tagCollectionsPage.excludeTagsHint', { code: '-' }) }}
          </p>
        </div>
      </form>
    </div>

    <template #actions>
      <button
        v-if="dialogMode === 'update'"
        class="mr-auto inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium ring-1 ring-base-0/20 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
        type="button"
        @click="deleteItem"
      >
        {{ $t('pages.premium.tagCollectionsPage.deleteButton') }}
      </button>

      <button
        class="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium ring-1 ring-base-0/20 hover:hover-bg-util hover:hover-text-util focus-visible:focus-outline-util"
        form="create-form"
        type="submit"
      >
        {{
          dialogMode === 'create'
            ? $t('pages.premium.tagCollectionsPage.createButton')
            : $t('pages.premium.tagCollectionsPage.saveButton')
        }}
      </button>
    </template>
  </Slideover>
</template>
