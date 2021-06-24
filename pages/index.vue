<template>
  <div
    class="flex flex-col max-w-3xl min-h-screen px-4 mx-auto sm:px-6 lg:px-8"
  >
    <!-- Top menu -->
    <nav class="flex flex-row items-center justify-between py-4">
      <DomainSelector
        :activeDomain="getActiveBooru.domain"
        :domainGroupList="booruGroupList"
        @domainChange="onDomainChange"
      />

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
import { mapGetters, mapActions } from 'vuex'

// Mixins
import UrlManagerMixin from '~/components/pages/posts/navigation/url/UrlManagerMixin.js'

export default {
  mixins: [UrlManagerMixin],

  computed: {
    ...mapGetters('booru', [
      'getActiveBooru',
      'getDefaultBooruList',
      'getPremiumBooruList',
      'getPosts',
    ]),
    ...mapGetters('premium', ['isUserPremium']),

    dynamicBufferHeight() {
      return window.screen.availHeight * 1.5
    },

    booruGroupList() {
      const BOORU_LIST = []

      // Default boorus
      const DOMAINS_FROM_DEFAULT_BOORU_LIST = this.getDefaultBooruList.map(
        (BOORU) => BOORU.domain
      )
      const DEFAULT_BOORU_LIST = {
        name: 'Default',
        domains: DOMAINS_FROM_DEFAULT_BOORU_LIST,
      }

      BOORU_LIST.push(DEFAULT_BOORU_LIST)

      // Premium boorus
      const DOMAINS_FROM_PREMIUM_BOORU_LIST = this.getPremiumBooruList.map(
        (BOORU) => BOORU.domain
      )
      const PREMIUM_BOORU_LIST = {
        name: 'Custom',
        domains: [...DOMAINS_FROM_PREMIUM_BOORU_LIST, '<Add Booru>'],
      }

      if (this.isUserPremium) {
        BOORU_LIST.push(PREMIUM_BOORU_LIST)
      }
      return BOORU_LIST
    },
  },

  methods: {
    ...mapActions('booru', ['activeBooruManager']),

    async onDomainChange(domain) {
      if (domain === '<Add Booru>') {
        await this.$router.push({ name: 'premium' })
        return
      }

      await this.activeBooruManager({ operation: 'set', value: domain })
    },
  },
}
</script>
