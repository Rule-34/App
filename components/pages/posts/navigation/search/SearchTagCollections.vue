<template>
  <div
    aria-labelledby="tag-collections-title"
    aria-modal="true"
    class="fixed inset-0 z-30 overflow-y-auto"
    role="dialog"
  >
    <div
      class="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0"
    >
      <!-- Background overlay -->
      <div
        aria-hidden="true"
        class="fixed inset-0 bg-black bg-opacity-75"
        @click.self.stop="toggleTagCollections"
      >
        <!--  -->
      </div>

      <!-- This element is to trick the browser into centering the modal contents. -->
      <span
        aria-hidden="true"
        class="hidden sm:inline-block sm:align-middle sm:h-screen"
      >
        &#8203;
      </span>

      <!-- Modal panel -->
      <div
        class="inline-block w-full max-w-xl p-4 align-bottom transform material-container sm:align-middle"
      >
        <div class="text-center">
          <h3
            id="tag-collections-title"
            class="text-lg font-medium leading-6 text-accent-400"
          >
            Tag Collections
          </h3>
        </div>

        <div class="my-4">
          <!--  -->

          <ul class="space-y-3">
            <!--  -->

            <template v-if="getCustomTagCollections.length">
              <!--  -->

              <li
                v-for="(tagCollection, index) in getCustomTagCollections"
                :key="tagCollection.name"
                class="px-2 py-1 text-left border-util focus-within:focus-util group"
              >
                <!--  -->

                <button
                  class="flex justify-between w-full"
                  type="button"
                  @click="addTagCollectionToTags(index)"
                >
                  <span
                    class="text-gray-300 truncate group-hover:text-gray-200"
                  >
                    {{ tagCollection.name }}
                  </span>

                  <span
                    class="shrink-0 text-primary-500 group-hover:text-primary-400"
                  >
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
                  <NuxtLink class="link" to="/premium"> Create some?</NuxtLink>
                </template>
              </Error>
            </template>
          </ul>
        </div>

        <div class="space-y-1 text-sm">
          <NuxtLink class="link" to="/premium">Create more</NuxtLink>

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
import { mapActions, mapGetters } from "vuex";
import { TagIcon } from "vue-feather-icons";

export default {
  components: {
    TagIcon
  },

  props: {
    searchTags: {
      type: Array,
      default() {
        return [];
      }
    }
  },

  computed: {
    ...mapGetters("user", ["getCustomTagCollections"])
  },

  methods: {
    ...mapActions("user", ["customTagCollectionsManager"]),

    toggleTagCollections() {
      this.$emit("toggleTagCollections");
    },

    addTagCollectionToTags(tagCollectionIndex) {
      this.$emit(
        "mergeToSearchTags",
        this.getCustomTagCollections[tagCollectionIndex].tags
      );

      this.toggleTagCollections();
    },

    saveSearchTagsToTagCollection() {
      if (!this.searchTags.length) {
        return;
      }

      const tagCollectionName = prompt(
        "Choose a name for the new Tag Collection."
      );

      if (!tagCollectionName) {
        alert("Wrong input, only text please.");
        return;
      }

      this.customTagCollectionsManager({
        operation: "add",
        value: {
          name: tagCollectionName,
          tags: this.searchTags
        }
      });
    }
  }
};
</script>
