<template>
  <main class="flex flex-col max-w-3xl min-h-screen p-4 mx-auto sm:p-6 lg:p-8">
    <div>
      <!-- Booru list -->
      <div class="px-2 py-1 overflow-scroll material-container">
        <table
          class="w-full text-left border-separate"
          style="border-spacing: 0.25em"
        >
          <thead>
            <tr>
              <th class="font-normal text-gray-200">Name</th>
              <th class="font-normal text-gray-200">Tags</th>
            </tr>
          </thead>

          <tbody class="text-gray-300 truncate">
            <template v-if="getTagCollections.length">
              <tr
                v-for="tagCollection in getTagCollections"
                :key="tagCollection.name"
              >
                <td class="text-sm" @click="deleteTagCollection(tagCollection)">
                  {{ tagCollection.name }}
                </td>

                <td
                  class="text-xs"
                  @click="copyTagCollectionToFormCollection(tagCollection)"
                >
                  {{ tagCollection.tags.join(', ') }}
                </td>
              </tr>
            </template>

            <!-- No tag collections -->
            <template v-else>
              <tr>
                <td class="text-sm text-center" colspan="999">
                  There are no custom tag collections
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <p class="p-2 text-xs text-center text-gray-300">
        Click on the `name` to remove. Click on the `tags` to copy.
      </p>
    </div>

    <!-- Spacer -->
    <div class="flex-auto">&nbsp;</div>

    <!-- Booru editor -->
    <form
      class="flex flex-col p-4 space-y-2 text-gray-200 material-container"
      @submit.prevent="addTagCollection"
    >
      <!-- Name -->
      <label>
        <p class="mb-1 text-gray-300">Name</p>

        <input
          v-model="formTagCollection.name"
          type="text"
          name="tagCollectionName"
          class="block w-full p-1 outline-none bg-darkGray-700"
          required
        />
      </label>

      <!-- Tags -->
      <label>
        <p class="mb-1 text-gray-300">Tags</p>

        <textarea
          v-model="formTagCollection.tags"
          class="block w-full p-1 outline-none bg-darkGray-700"
          name="tagCollectionTags"
          rows="2"
          required
          spellcheck="false"
        />

        <p class="p-2 text-xs italic text-right text-gray-300">
          Separate tags with spaced commas (", ").
        </p>
      </label>

      <button
        type="submit"
        class="w-full px-2 py-1 tracking-wide rounded-full bg-gradient-to-r from-primary-400 to-accent-400"
      >
        Add
      </button>
    </form>
  </main>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  data() {
    return {
      formTagCollection: {
        name: null,
        tags: null,
      },
    }
  },

  head() {
    return {
      title: 'Custom tag collections',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: 'Create custom tag collections',
        },
      ],
    }
  },

  computed: {
    ...mapGetters('user', ['getTagCollections']),
  },

  methods: {
    ...mapActions('user', ['customTagCollectionsManager']),

    addTagCollection() {
      this.customTagCollectionsManager({
        operation: 'add',
        value: {
          name: this.formTagCollection.name,
          tags: this.formTagCollection.tags.split(', '),
        },
      })
    },

    deleteTagCollection(tagCollection) {
      this.customTagCollectionsManager({
        operation: 'remove',
        value: tagCollection,
      })
    },

    copyTagCollectionToFormCollection(tagCollection) {
      // Clone as a weird fix so Vuex does not crash
      this.formTagCollection = {
        name: tagCollection.name,
        tags: tagCollection.tags.join(', '),
      }
    },
  },
}
</script>
