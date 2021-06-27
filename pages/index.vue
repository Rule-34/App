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

      <ul class="flex-auto space-y-4">
        <template v-if="getPosts.length">
          <li v-for="POST in getPosts" :key="POST.id">
            <Post :post="POST" />
          </li>
        </template>

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

    booruGroupList() {
      const BOORU_GROUP_LIST = []

      const DOMAINS_FROM_DEFAULT_BOORU_LIST = this.getDefaultBooruList.map(
        (BOORU) => BOORU.domain
      )

      // Default Booru list
      const DEFAULT_BOORU_GROUP = {
        name: 'Default',
        domains: DOMAINS_FROM_DEFAULT_BOORU_LIST,
      }

      BOORU_GROUP_LIST.push(DEFAULT_BOORU_GROUP)

      const DOMAINS_FROM_PREMIUM_BOORU_LIST = this.getPremiumBooruList.map(
        (BOORU) => BOORU.domain
      )

      // Premium Booru list
      const PREMIUM_BOORU_GROUP = {
        name: 'Custom',
        domains: [...DOMAINS_FROM_PREMIUM_BOORU_LIST, '<Add Booru>'],
      }

      if (this.isUserPremium) {
        BOORU_GROUP_LIST.push(PREMIUM_BOORU_GROUP)
      }
      return BOORU_GROUP_LIST
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
