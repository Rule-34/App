<template>
  <!-- 
    This should use Vue 3's teleport feature
    https://v3.vuejs.org/guide/teleport.html
  -->
  <aside
    class="fixed inset-0 z-40 w-full h-full bg-black bg-opacity-25"
    @click.self.stop="toggleTagCollections"
  >
    <!-- Constraint -->
    <div
      class="h-full max-w-2xl p-6 mx-auto sm:p-8 lg:p-10"
      @click.self.stop="toggleTagCollections"
    >
      <!-- Content -->
      <menu class="flex flex-col w-full h-full p-4 m-0 material-container">
        <!-- Title -->
        <header
          class="text-xl font-semibold tracking-wide text-center text-gradient-one"
        >
          Tag Collections
        </header>

        <!-- Tag Collections -->
        <section
          class="flex-auto mt-4 space-y-2 overflow-y-scroll text-default-text"
        >
          <template v-if="getTagCollections.length">
            <article
              v-for="(tagCollection, index) in getTagCollections"
              :key="tagCollection.name"
              class="flex items-center justify-between px-2 py-1 material-container bg-background"
              @click="addTagCollectionToTags(index)"
            >
              <p class="truncate">{{ tagCollection.name }}</p>

              <div class="flex-shrink-0 color-util">
                {{ tagCollection.tags.length }}

                <TagIcon class="inline w-5 h-5 icon" />
              </div>
            </article>
          </template>

          <template v-else>
            <Error
              :render-borders="false"
              error-data="No Tag Collections available"
            >
              <template #customAction>
                <NuxtLink to="/premium">Create some?</NuxtLink>
              </template>
            </Error>
          </template>
        </section>

        <!-- CTA -->
        <footer class="text-center">
          <NuxtLink class="text-sm" to="/premium">Create more</NuxtLink>
        </footer>
      </menu>
    </div>
  </aside>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { TagIcon } from 'vue-feather-icons'

import Error from '~/components/utils/Error.vue'

export default {
  components: {
    TagIcon,
    Error,
  },

  computed: {
    ...mapGetters('user', ['getTagCollections']),
  },

  methods: {
    ...mapActions('booru', ['tagsManager']),

    async addTagCollectionToTags(tagCollectionIndex) {
      await this.tagsManager({
        operation: 'merge',
        value: this.getTagCollections[tagCollectionIndex].tags,
      })
    },

    toggleTagCollections() {
      this.$emit('toggleTagCollections')
    },
  },
}
</script>
