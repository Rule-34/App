<template>
  <main class="flex flex-col max-w-3xl min-h-screen p-4 mx-auto sm:p-6 lg:p-8">
    <div>
      <!-- Booru list -->
      <div class="px-2 py-1 overflow-x-scroll material-container">
        <table
          class="w-full text-left border-separate"
          style="border-spacing: 0.25em"
        >
          <thead>
          <tr>
            <th class="text-lg font-normal text-gray-200">Name</th>
            <th class="text-lg font-normal text-gray-200">Tags</th>
          </tr>
          </thead>

          <tbody class="text-gray-300 truncate">
          <template v-if="getCustomTagCollections.length">
            <tr
              v-for="tagCollection in getCustomTagCollections"
              :key="tagCollection.name"
            >
              <td @click="deleteTagCollection(tagCollection)">
                {{ tagCollection.name }}
              </td>

              <td
                class="text-sm"
                @click="copyTagCollectionToFormCollection(tagCollection)"
              >
                {{ tagCollection.tags.join(", ") }}
              </td>
            </tr>
          </template>

          <!-- No tag collections -->
          <template v-else>
            <tr>
              <td class="text-center" colspan="999">
                There are no custom tag collections
              </td>
            </tr>
          </template>
          </tbody>
        </table>
      </div>

      <p class="p-2 text-xs text-center text-gray-300">
        Click on the `name` to remove. Click on the `tags` to copy
      </p>
    </div>

    <!-- Spacer -->
    <div class="flex-auto">&nbsp;</div>

    <!-- Booru editor -->
    <form
      class="p-4 space-y-4 material-container"
      @submit.prevent="addTagCollection"
    >
      <!-- Name -->
      <label class="block space-y-1">
        <p class="text-lg text-gray-200">Name</p>

        <input
          v-model="formTagCollection.name"
          class="block p-1 text-gray-300 outline-none border-util bg-darkGray-700 focus:focus-util"
          name="tagCollectionName"
          required
          type="text"
        />
      </label>

      <!-- Tags -->
      <label class="block space-y-1">
        <p class="text-lg text-gray-200">Tags</p>

        <textarea
          v-model="formTagCollection.tags"
          class="block w-full p-1 text-gray-300 outline-none bg-darkGray-700 border-util focus:focus-util"
          name="tagCollectionTags"
          required
          rows="3"
          spellcheck="false"
        />

        <p class="p-2 text-xs text-gray-300">
          Separate tags with spaced commas: `, `
        </p>
      </label>

      <button
        class="w-full px-2 py-1 tracking-wide rounded-full bg-gradient-to-r from-primary-400 to-accent-400 focus:focus-util"
        type="submit"
      >
        Add
      </button>
    </form>
  </main>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  data() {
    return {
      formTagCollection: {
        name: null,
        tags: null
      }
    };
  },

  head() {
    return {
      title: "Tag Collections",
      meta: [
        {
          hid: "description",
          name: "description",
          content: "Create collections of tags."
        }
      ]
    };
  },

  computed: {
    ...mapGetters("user", ["getCustomTagCollections"])
  },

  methods: {
    ...mapActions("user", ["customTagCollectionsManager"]),

    addTagCollection() {
      this.customTagCollectionsManager({
        operation: "add",
        value: {
          name: this.formTagCollection.name,
          tags: this.formTagCollection.tags.split(", ")
        }
      });
    },

    deleteTagCollection(tagCollection) {
      this.customTagCollectionsManager({
        operation: "remove",
        value: tagCollection
      });
    },

    copyTagCollectionToFormCollection(tagCollection) {
      // Clone as a weird fix so Vuex does not crash
      this.formTagCollection = {
        name: tagCollection.name,
        tags: tagCollection.tags.join(", ")
      };
    }
  }
}
</script>
