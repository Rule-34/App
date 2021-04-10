<template>
  <div
    class="fixed inset-0 z-30 overflow-y-auto"
    aria-labelledby="tag-collections-title"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0"
    >
      <!-- Background overlay -->
      <div
        class="fixed inset-0 bg-black bg-opacity-75"
        aria-hidden="true"
        @click.self.stop="toggleTagCollections"
      >
        <!--  -->
      </div>

      <!-- This element is to trick the browser into centering the modal contents. -->
      <span
        class="hidden sm:inline-block sm:align-middle sm:h-screen"
        aria-hidden="true"
      >
        &#8203;
      </span>

      <!-- Modal panel -->
      <div
        class="inline-block w-full max-w-xl p-4 align-bottom transform material-container sm:align-middle"
      >
        <div class="text-center">
          <h3
            class="text-lg font-medium leading-6 text-accent-400"
            id="tag-collections-title"
          >
            Tag Collections
          </h3>
        </div>

        <div class="my-4">
          <!--  -->

          <ul class="space-y-3">
            <!--  -->

            <template v-if="getTagCollections.length">
              <!--  -->

              <li
                class="px-2 py-1 text-left border-util focus-within:focus-util"
                v-for="(tagCollection, index) in getTagCollections"
                :key="tagCollection.name"
              >
                <!--  -->

                <button
                  type="button"
                  class="flex justify-between w-full"
                  @click="addTagCollectionToTags(index)"
                >
                  <span class="text-gray-300 truncate">
                    {{ tagCollection.name }}
                  </span>

                  <span class="flex-shrink-0 text-primary-500">
                    {{ tagCollection.tags.length }}

                    <TagIcon class="inline w-5 h-5 icon" />
                  </span>
                </button>
              </li>
            </template>

            <template v-else>
              <Error
                :render-borders="false"
                error-data="No Tag Collections available"
              >
                <template #customAction>
                  <NuxtLink to="/premium" class="link"> Create some? </NuxtLink>
                </template>
              </Error>
            </template>
          </ul>
        </div>

        <div class="space-y-1 text-sm">
          <NuxtLink to="/premium" class="link">Create more</NuxtLink>

          <p class="text-xs text-gray-300">Or</p>

          <button
            class="link"
            type="button"
            @click="saveSearchTagsToTagCollection"
          >
            Create from current tags
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { TagIcon } from 'vue-feather-icons'

export default {
  components: {
    TagIcon,
  },

  props: {
    searchTags: {
      type: Array,
      default() {
        return []
      },
    },
  },

  computed: {
    ...mapGetters('user', ['getTagCollections']),
  },

  methods: {
    ...mapActions('booru', ['tagsManager']),
    ...mapActions('user', ['customTagCollectionsManager']),

    toggleTagCollections() {
      this.$emit('toggleTagCollections')
    },

    addTagCollectionToTags(tagCollectionIndex) {
      this.$emit(
        'mergeToSearchTags',
        this.getTagCollections[tagCollectionIndex].tags
      )

      this.toggleTagCollections()
    },

    saveSearchTagsToTagCollection() {
      if (!this.searchTags.length) {
        return
      }

      const tagCollectionName = prompt(
        'Choose a name for the new Tag Collection.'
      )

      if (!tagCollectionName) {
        alert('Wrong input, only text please.')
        return
      }

      this.customTagCollectionsManager({
        operation: 'add',
        value: {
          name: tagCollectionName,
          tags: this.searchTags,
        },
      })
    },
  },
}
</script>
