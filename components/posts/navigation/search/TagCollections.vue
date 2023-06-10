<script lang="ts" setup>
  import { DialogTitle } from '@headlessui/vue'
  import Tag from 'assets/js/tag.dto'
  import { PlusIcon, TagIcon } from '@heroicons/vue/24/outline'
  import { toast } from 'vue-sonner'
  import TagCollection from 'assets/js/tagCollection.dto'

  const props = defineProps<{
    selectedTags: Tag[]
  }>()

  const emit = defineEmits<{
    updateSelectedTags: [selectedTags: Tag[]]
  }>()

  const { isPremium } = useUserData()

  const { tagCollections } = useTagCollections()

  function setTagCollectionAsSelected(tagCollection: TagCollection) {
    if (!isPremium) {
      toast.error('[Premium feature] You need to be a premium user to use this feature')
      return
    }

    const selectedTags = tagCollection.tags.map((tagName) => new Tag({ name: tagName }))

    emit('updateSelectedTags', selectedTags)
  }

  function createTagCollectionFromSelectedTags() {
    const selectedTags = props.selectedTags

    if (selectedTags.length === 0) {
      toast.error('You need to select at least one tag')
      return
    }

    const name = prompt('Enter a name for the new tag collection')

    if (!name) {
      return
    }

    if (tagCollections.value.some((tagCollection) => tagCollection.name === name)) {
      toast.error('A tag collection with this name already exists')
      return
    }

    const tagCollection = new TagCollection({
      name,
      tags: selectedTags.map((tag) => tag.name)
    })

    tagCollections.value.push(tagCollection)
  }
</script>

<template>
  <nav class="flex min-h-[35rem] flex-col gap-6">
    <header>
      <DialogTitle
        as="h3"
        class="text-lg font-medium leading-9 text-base-content-highlight"
      >
        Tag Collections
      </DialogTitle>

      <h4 class="text-sm">List of tags that you can create for easier access</h4>
    </header>

    <!-- Body -->
    <section class="flex-auto">
      <ol class="space-y-4 overflow-y-auto p-1">
        <!-- -->

        <li v-for="tagCollection in tagCollections">
          <!-- -->

          <button
            class="focus-visible:focus-util hover:hover-text-util hover:hover-bg-util inline-flex w-full items-center justify-between rounded-md px-2 py-1 ring-1 ring-base-0/20"
            type="button"
            @click="setTagCollectionAsSelected(tagCollection)"
          >
            <span>{{ tagCollection.name }}</span>

            <div class="flex items-center justify-center gap-x-1">
              <span>
                {{ tagCollection.tags.length }}
              </span>

              <TagIcon class="h-5 w-5" />
            </div>
          </button>
        </li>
      </ol>
    </section>

    <footer class="">
      <!-- -->

      <button
        class="focus-visible:focus-util hover:hover-text-util hover:hover-bg-util inline-flex items-center gap-x-1 rounded-md px-2 py-1 ring-1 ring-base-0/20"
        type="button"
        @click="createTagCollectionFromSelectedTags"
      >
        <PlusIcon class="-ml-0.5 h-5 w-5" />

        <span class="whitespace-nowrap font-medium">Create from current tags</span>
      </button>
    </footer>
  </nav>
</template>
