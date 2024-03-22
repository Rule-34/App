<script lang="ts" setup>
  import { ArrowUturnLeftIcon, Bars2Icon, PencilIcon, PlusIcon } from '@heroicons/vue/20/solid'
  import { moveArrayElement, useSortable } from '@vueuse/integrations/useSortable'
  import type { ComputedRef, Ref } from 'vue'
  import { toast } from 'vue-sonner'
  import { TagCollection, type ITagCollection } from '~/assets/js/tagCollection.dto'
  import Slideover from '~/components/layout/Slideover.vue'
  import { useTagCollections } from '~/composables/useTagCollections'

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
    middleware: ['auth', 'auth-check']
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

            <Bars2Icon class="h-4 w-4 text-base-content group-hover:text-base-content-hover" />
          </div>

          <!-- Tag Length -->
          <div
            class="flex h-5 w-8 flex-shrink-0 items-center justify-center overflow-x-hidden rounded-full bg-base-0/20 px-2 text-sm tabular-nums"
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
              class="hover:hover-text-util focus-visible:focus-outline-util hover:hover-bg-util inline-flex items-center justify-center rounded-md p-2"
              type="button"
              @click="openEditDialog(index)"
            >
              <span class="sr-only">Edit</span>
              <PencilIcon class="h-4 w-4" />
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
        <ArrowUturnLeftIcon class="mr-2 h-4 w-4" />

        Reset to default
      </button>

      <!-- Add -->
      <button
        class="hover:hover-text-util focus-visible:focus-outline-util hover:hover-bg-util inline-flex items-center justify-center gap-2 rounded-md px-2 py-1"
        type="button"
        @click="openCreateDialog"
      >
        Create collection

        <PlusIcon class="ml-2 mr-2 h-4 w-4" />
      </button>
    </section>
  </main>

  <!-- Dialog -->
  <Slideover
    :is-open="dialogOpen"
    @close="dialogOpen = false"
  >
    <template #title> {{ dialogMode === 'create' ? 'Create' : 'Edit' }} tag collection </template>

    <div class="divide-y divide-gray-200 px-4 sm:px-6">
      <!-- Form -->
      <form
        id="create-form"
        class="space-y-6 pb-5 pt-6"
        @submit.prevent="onFormSubmit"
      >
        <!-- Name -->
        <div>
          <label
            class="block font-medium leading-8 text-base-content-highlight"
            for="name"
          >
            Name
          </label>

          <input
            id="name"
            v-model="currentItem.name"
            class="hover:hover-text-util focus-visible:focus-outline-util hover:hover-bg-util w-full rounded-md border-base-0/20 bg-base-1000 px-2 py-1.5 sm:text-sm sm:leading-6"
            name="name"
            required
            type="text"
          />
        </div>

        <!-- Tags -->
        <div>
          <label
            class="block font-medium leading-8 text-base-content-highlight"
            for="tags"
          >
            Tags
          </label>

          <textarea
            id="tags"
            v-model="currentItem.tags"
            aria-describedby="tags-description"
            class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util mt-2 block w-full rounded-md border-base-0/20 bg-base-1000 py-1.5 pl-3 pr-10 sm:text-sm sm:leading-6"
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
        class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util mr-auto inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium ring-1 ring-base-0/20"
        type="button"
        @click="deleteItem"
      >
        Delete
      </button>

      <button
        class="focus-visible:focus-outline-util hover:hover-bg-util hover:hover-text-util inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium ring-1 ring-base-0/20"
        form="create-form"
        type="submit"
      >
        {{ dialogMode === 'create' ? 'Create' : 'Save' }}
      </button>
    </template>
  </Slideover>
</template>
