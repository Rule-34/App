<script lang="ts" setup>
  import { ArrowUturnLeftIcon, Bars2Icon, PencilIcon, PlusIcon } from '@heroicons/vue/20/solid'
  import { moveArrayElement, useSortable } from '@vueuse/integrations/useSortable'
  import type { ComputedRef, Ref } from 'vue'
  import { toast } from 'vue-sonner'
  import { type ITagCollection, TagCollection } from '~/assets/js/tagCollection.dto'
  import Slideover from '~/components/layout/Slideover.vue'

  const { tagCollections, resetTagCollections } = useTagCollections()

  const sortableElement = ref<HTMLElement | null>(null)

  useSortable(sortableElement, tagCollections, {
    handle: '.handle',
    animation: 150,

    onUpdate: (e: any) => {
      nextTick(() => {
        moveArrayElement(tagCollections.value, e.oldIndex, e.newIndex)
      })
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

  const currentItem: Ref<ITagCollection> = shallowRef(
    new TagCollection({
      name: '',
      tags: []
    })
  )

  function resetTagCollectionsToDefault() {
    if (!confirm('Are you sure you want to reset all Tag collections to default?')) {
      return
    }

    resetTagCollections()
  }

  function openCreateDialog() {
    currentItem.value = new TagCollection({
      name: '',
      tags: []
    })

    dialogEditIndex.value = null
    dialogOpen.value = true
  }

  function openEditDialog(index: number) {
    const tagCollection = tagCollections.value[index]

    // TODO: Design a better way to encode and decode tags
    currentItem.value = new TagCollection({
      name: tagCollection.name,
      tags: tagCollection.tags.join('\n')
    })

    dialogEditIndex.value = index
    dialogOpen.value = true
  }

  function onFormSubmit() {
    if (dialogMode.value === 'create') {
      createItem()
    } else {
      editItem()
    }
  }

  function createItem() {
    // Validations
    if (!currentItem.value.name || !currentItem.value.tags.length) {
      toast.error('Please fill out all fields')
      return
    }

    if (tagCollections.value.find((tagCollection) => tagCollection.name === currentItem.value.name)) {
      toast.error('Tag collection with this name already exists')
      return
    }

    // TODO: Design a better way to encode and decode tags
    tagCollections.value.push(
      new TagCollection({
        name: currentItem.value.name,
        tags: tagsStringToArray(currentItem.value.tags)
      })
    )

    dialogOpen.value = false
  }

  function editItem() {
    // Validations
    if (!currentItem.value.name || !currentItem.value.tags.length) {
      toast.error('Please fill out all fields')
      return
    }

    // TODO: Design a better way to encode and decode tags
    tagCollections.value[dialogEditIndex.value!] = new TagCollection({
      name: currentItem.value.name,
      tags: tagsStringToArray(currentItem.value.tags)
    })

    dialogOpen.value = false
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

  function deleteItem() {
    tagCollections.value.splice(dialogEditIndex.value!, 1)

    dialogOpen.value = false
  }

  useSeoMeta({
    title: 'Tag collections'
  })

  definePageMeta({
    middleware: ['auth']
  })
</script>

<template>
  <main class="container mx-auto flex max-w-3xl flex-1 flex-col px-4 py-4 sm:px-6 lg:px-8">
    <PageHeader>
      <template #title>Tag collections</template>
      <template #text>Lists of tags to quickly search or filter posts</template>
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
            <span class="sr-only">Drag to reorder</span>

            <Bars2Icon aria-hidden="true" class="text-base-content group-hover:text-base-content-hover h-4 w-4" />
          </div>

          <!-- Tag Length -->
          <div
            class="bg-base-0/20 flex h-5 w-8 shrink-0 items-center justify-center overflow-x-hidden rounded-full px-2 text-sm tabular-nums"
          >
            {{ tagCollection.tags.length }}

            <span class="sr-only"> Tags in tag collection </span>
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
              aria-label="Edit"
              class="hover:hover-text-util focus-visible:focus-outline-util hover:hover-bg-util inline-flex items-center justify-center rounded-md p-2"
              type="button"
              @click="openEditDialog(index)"
            >
              <PencilIcon aria-hidden="true" class="h-4 w-4" />
            </button>
          </div>
        </li>
      </ol>
    </section>

    <!-- Actions -->
    <section class="mt-4 flex items-center justify-between gap-2">
      <!-- Reset to default -->
      <button
        class="hover:hover-text-util focus-visible:focus-outline-util hover:hover-bg-util inline-flex items-center justify-center gap-2 rounded-md px-2 py-1"
        type="button"
        @click="resetTagCollectionsToDefault"
      >
        <ArrowUturnLeftIcon aria-hidden="true" class="mr-2 h-4 w-4" />

        Reset to default
      </button>

      <!-- Add -->
      <button
        class="hover:hover-text-util focus-visible:focus-outline-util hover:hover-bg-util inline-flex items-center justify-center gap-2 rounded-md px-2 py-1"
        type="button"
        @click="openCreateDialog"
      >
        Create collection

        <PlusIcon aria-hidden="true" class="mr-2 ml-2 h-4 w-4" />
      </button>
    </section>
  </main>

  <!-- Dialog -->
  <Slideover
    :is-open="dialogOpen"
    @close="dialogOpen = false"
  >
    <template #title> {{ dialogMode === 'create' ? 'Create' : 'Edit' }} tag collection</template>

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
            class="text-base-content-highlight block leading-8 font-medium"
            for="name"
          >
            Name
          </label>

          <input
            id="name"
            v-model="currentItem.name"
            class="hover:hover-text-util focus-visible:focus-outline-util hover:hover-bg-util border-base-0/20 bg-base-1000 w-full rounded-md px-2 py-1.5 sm:text-sm sm:leading-6"
            name="name"
            required
            type="text"
          />
        </div>

        <!-- Tags -->
        <div>
          <label
            class="text-base-content-highlight block leading-8 font-medium"
            for="tags"
          >
            Tags
          </label>

          <textarea
            id="tags"
            v-model="currentItem.tags"
            aria-describedby="tags-description"
            class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util border-base-0/20 bg-base-1000 mt-2 block w-full rounded-md py-1.5 pr-10 pl-3 sm:text-sm sm:leading-6"
            name="tags"
            required
            rows="10"
          />

          <p
            id="tags-description"
            class="mt-2 text-sm"
          >
            One tag per line

            <br />

            Use <code>-</code> to exclude tags
          </p>
        </div>
      </form>
    </div>

    <template #actions>
      <button
        v-if="dialogMode === 'update'"
        class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util ring-base-0/20 mr-auto inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium ring-1"
        type="button"
        @click="deleteItem"
      >
        Delete
      </button>

      <button
        class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util ring-base-0/20 inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium ring-1"
        form="create-form"
        type="submit"
      >
        {{ dialogMode === 'create' ? 'Create' : 'Save' }}
      </button>
    </template>
  </Slideover>
</template>
