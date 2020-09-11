<template>
  <div class="flex" @click.self.stop="toggleTagCollections()">
    <menu class="flex flex-col w-4/5 p-4 m-auto h-3/5 material-container">
      <!-- Title -->
      <header
        class="mb-4 text-xl font-semibold tracking-wide text-center text-gradient-one"
      >
        Tag Collections
      </header>

      <!-- Tag Collections -->
      <section class="flex-grow space-y-2 overflow-y-scroll text-default-text">
        <template v-if="getTagCollections.length">
          <article
            v-for="(tagCollection, index) in getTagCollections"
            :key="tagCollection.name"
            class="flex items-center justify-between px-2 py-1 material-container bg-background"
            @click="addTagCollectionToAddedTags(index)"
          >
            <p class="truncate">{{ tagCollection.name }}</p>

            <div class="flex-shrink-0 color-util">
              {{ tagCollection.tags.length }}

              <TagIcon class="inline w-5 h-5 icon" />
            </div>
          </article>
        </template>

        <template v-else>
          <article class="text-center">
            <Error
              :render-borders="false"
              error-data="No Tag Collections available"
            >
              <template v-slot:customAction>
                <nuxt-link to="/premium">Create one?</nuxt-link>
              </template>
            </Error>
          </article>
        </template>
      </section>

      <!-- CTA -->
      <footer class="-mb-2 text-center">
        <nuxt-link class="text-sm" to="/premium"> Create more </nuxt-link>
      </footer>
    </menu>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { TagIcon } from 'vue-feather-icons'

import Error from '~/components/utils/Error.vue'

export default {
  name: 'SearchBar',

  components: {
    TagIcon,
    Error,
  },

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

      this.toggleTagCollections()
    },

    toggleTagCollections() {
      this.$emit('toggleTagCollections')
    },
  },
}
</script>
