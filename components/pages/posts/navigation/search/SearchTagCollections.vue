<template>
    <div class="p-4 m-auto pointer-events-auto material-container">
  <div class="absolute inset-0 z-30 flex pointer-events-none">
      <h2
        class="text-lg font-semibold tracking-wide text-center text-gradient-one"
      >
        Tag Collections
      </h2>

      <!-- Tag Collections -->
      <div class="mt-4">
        <template v-if="getTagCollections.length">
          <div
            v-for="(tagCollection, index) in getTagCollections"
            :key="tagCollection.name"
            class="flex items-center justify-between"
          >
            <p class="truncate">{{ tagCollection.name }}</p>

            <p
              class="flex-shrink-0 tag text-default-text hover:text-default-text-muted"
              @click="addTagCollectionToAddedTags(index)"
            >
              {{ `${tagCollection.tags.length} tags` }}
            </p>
          </div>
        </template>

        <template v-else>
          <div class="text-center">
            <h3>No Tag Collections available</h3>
            <nuxt-link to="/premium">Create one?</nuxt-link>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'SearchBar',

  computed: {
    ...mapGetters('user', ['getTagCollections']),
  },

  methods: {
    ...mapActions('booru', ['addedTagsManager']),

    addTagCollectionToAddedTags(tagCollectionIndex) {
      this.addedTagsManager({
        operation: 'concat',
        value: this.getTagCollections[tagCollectionIndex].tags,
      })

      this.$emit('toggleTagCollections')
    },
  },
}
</script>
