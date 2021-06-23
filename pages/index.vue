<template>
  <div
    class="flex flex-col max-w-3xl min-h-screen px-4 mx-auto sm:px-6 lg:px-8"
  >
    <!-- Top menu -->
    <nav class="flex flex-row items-center justify-between py-4">
      <DomainSelector />

      <Notifications />
    </nav>

    <!-- Content -->
    <main class="flex flex-col flex-auto min-h-full pb-4 space-y-4">
      <ErrorManager />

      <DynamicScroller
        :items="getPosts"
        :min-item-size="1000"
        :page-mode="true"
        :buffer="dynamicBufferHeight"
        class="flex-auto"
      >
        <template v-slot="{ item, index, active }">
          <DynamicScrollerItem
            :item="item"
            :active="active"
            :data-index="index"
          >
            <Post
              :key="item.id"
              :post-domain="getActiveBooru.domain"
              :post-data="item"
              class="my-2"
            />
          </DynamicScrollerItem>
        </template>
      </DynamicScroller>

      <PostsControls />
    </main>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

// Mixins
import UrlManagerMixin from '~/components/pages/posts/navigation/url/UrlManagerMixin.js'

export default {
  mixins: [UrlManagerMixin],

  computed: {
    ...mapGetters('booru', ['getPosts', 'getActiveBooru']),

    dynamicBufferHeight() {
      return window.screen.availHeight * 1.5
    },
  },
}
</script>
