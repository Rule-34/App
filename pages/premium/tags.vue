<template>
  <main class="flex flex-col justify-around h-screen space-y-4 space-y-4-fixer">
    <div>
      <!-- Booru list -->
      <div class="px-2 py-1 overflow-x-scroll material-container">
        <table class="w-full text-left text-default-text">
          <thead>
            <tr>
              <th class="font-normal">Name</th>
              <th class="font-normal">Tags</th>
            </tr>
          </thead>

          <tbody class="text-default-text-muted">
            <template v-if="getTagCollections.length">
              <tr
                v-for="tagCollection in getTagCollections"
                :key="tagCollection.name"
              >
                <td class="text-sm" @click="deleteTagCollection(tagCollection)">
                  {{ tagCollection.name }}
                </td>

                <td
                  class="text-sm"
                  @click="copyTagCollectionToFormCollection(tagCollection)"
                >
                  {{ tagCollection.tags.join(', ') }}
                </td>
              </tr>
            </template>

            <!-- No tag collections -->
            <template v-else>
              <tr>
                <td class="text-center" colspan="10">
                  There are no custom tag collections
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <p class="p-2 text-xs text-center text-default-text-muted">
        Tip: Click on the name to remove it, and on the tags to copy it
      </p>
    </div>

    <!-- Spacer -->
    <div class="flex-grow">&nbsp;</div>

    <!-- Booru editor -->
    <form
      class="flex flex-col p-4 space-y-2 material-container text-default-text"
      action="#"
      @submit.prevent="addTagCollection()"
    >
      <!-- Name -->
      <label>
        <p class="mb-1 text-default-text-muted">Name</p>

        <input
          v-model="formTagCollection.name"
          type="text"
          name="tagCollectionName"
          value=""
          class="block w-full p-1 outline-none bg-background"
          required
        />
      </label>

      <!-- Tags -->
      <label>
        <p class="mb-1 text-default-text-muted">Tags</p>

        <textarea
          v-model="formTagCollection.tags"
          class="block w-full p-1 outline-none bg-background"
          name="tagCollectionTags"
          rows="2"
          required
          spellcheck="false"
        />

        <p class="p-2 text-xs italic text-right text-default-text-muted">
          Separate tags with commas, ","
        </p>
      </label>

      <button
        type="submit"
        class="w-full px-2 py-1 tracking-wide rounded-full shadow-md bg-gradient-blue-lilac"
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

    copyTagCollectionToFormCollection(tagCollection) {
      this.formTagCollection = {
        name: tagCollection.name,
        tags: tagCollection.tags.join(', '),
      } // Reconstruct object as a weird fix so Vuex doesnt crash
    },

    deleteTagCollection(tagCollection) {
      this.customTagCollectionsManager({
        operation: 'remove',
        value: tagCollection,
      })
    },
  },

  head() {
    return {
      title: 'Custom tag collections',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: 'Modify the Custom Tag Collections',
        },
      ],
    }
  },
}
</script>
