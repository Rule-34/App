<script lang="ts" setup>
  import Tag from '~/assets/js/tag.dto'
  import { Cog6ToothIcon, PlusIcon, TagIcon } from '@heroicons/vue/24/outline'
  import { toast } from 'vue-sonner'
  import { TagCollection } from '~/assets/js/tagCollection.dto'

  const props = defineProps<{
    selectedTags: Tag[]
  }>()

  const emit = defineEmits<{
    updateSelectedTags: [selectedTags: Tag[]]
  }>()

  const { isPremium } = useUserData()

  const { tagCollections } = useTagCollections()

  function setTagCollectionAsSelected(tagCollection: TagCollection) {
    if (!isPremium.value) {
      toast.info('Premium feature', {
        description: 'You need to be a premium user to use this feature',
        action: {
          label: 'Subscribe',
          onClick: () => navigateTo('/premium?utm_source=internal&utm_medium=tag-collections')
        }
      })
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
  <!-- TODO: Review padding on desktop -->

  <nav class="relative flex flex-col gap-6">
    <header>
      <HeadlessDialogTitle
        as="h3"
        class="text-lg font-medium leading-10 text-base-content-highlight"
      >
        Tag Collections
      </HeadlessDialogTitle>

      <h4 class="text-sm">List of tags that you can create for easy access</h4>
    </header>

    <div class="absolute right-0 top-0.5">
      <NuxtLink
        class="focus-visible:focus-outline-util hover:hover-text-util hover:hover-bg-util inline-flex w-full items-center gap-x-1.5 rounded-md p-1"
        to="/premium/tag-collections"
      >
        <span class="sr-only"> Manage tag collections </span>

        <Cog6ToothIcon class="h-6 w-6" />
      </NuxtLink>
    </div>

    <!-- Body -->
    <section class="flex-auto overflow-y-auto">
      <ol class="space-y-4 p-1">
        <!-- -->

        <li v-for="tagCollection in tagCollections">
          <!-- -->

          <button
            class="focus-visible:focus-outline-util hover:hover-text-util hover:hover-bg-util inline-flex w-full items-center justify-between rounded-full px-4 py-1 ring-1 ring-base-0/20"
            type="button"
            @click="setTagCollectionAsSelected(tagCollection)"
          >
            <span>{{ tagCollection.name }}</span>

            <div class="flex items-center justify-center gap-x-1.5">
              <span>
                {{ tagCollection.tags.length }}
              </span>

              <TagIcon class="h-5 w-5" />
            </div>
          </button>
        </li>

        <!-- Create from current selected tags -->
        <!-- TODO: Improve design and cohesion -->
        <li>
          <button
            class="focus-visible:focus-outline-util hover:hover-text-util hover:hover-bg-util inline-flex w-full items-center justify-between rounded-full px-4 py-1 ring-1 ring-base-0/20"
            type="button"
            @click="createTagCollectionFromSelectedTags"
          >
            <span class="whitespace-nowrap">Create from current tags</span>

            <PlusIcon class="h-5 w-5" />
          </button>
        </li>
      </ol>
    </section>
  </nav>
</template>
