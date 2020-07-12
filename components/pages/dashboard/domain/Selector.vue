<template>
  <div class="relative flex m-0 rounded-full material-container">
    <!-- Cloud icon -->
    <div for="domain-selector" class="inline-flex items-center pl-2 pr-1">
      <CloudIcon class="w-4 h-4 icon text-primary" />
    </div>

    <!-- Selector -->
    <select
      :value="booruData.active.domain"
      aria-label="Selector that changes the domain where the content is pulled from"
      class="inline-flex items-center font-light outline-none appearance-none text-primary bg-elevation"
      @change="changeDomain($event.target.value)"
    >
      <!-- Loop for every option -->
      <option
        v-for="booru in boorus"
        :key="booru.domain"
        :aria-label="'Changes the domain to ' + booru.domain"
        :value="booru.domain"
      >
        {{ booru.domain }}
      </option>
    </select>

    <!-- Drop icon -->
    <div class="inline-flex items-center pl-1 pr-2">
      <ChevronDownIcon class="w-4 h-4 icon text-default" />
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'

// Third party
import { ChevronDownIcon, CloudIcon } from 'vue-feather-icons'

import { findBoorusWithValueByKey } from '~/assets/lib/rule-34-shared-resources/util/BooruUtils.js'

import fireAnalytics from '~/assets/js/analytics'

export default {
  name: 'DomainSelector',
  components: { ChevronDownIcon, CloudIcon },

  computed: {
    ...mapState(['booruData', 'credentials']),
    ...mapState('user', ['settings']),

    boorus() {
      return this.evaluateBooruList(this.settings.nsfw.value)
    },
  },

  methods: {
    ...mapMutations(['booruDataManager', 'pidManager', 'tagManager']),
    ...mapActions(['fetchWithMode']),

    evaluateBooruList(nsfwSetting) {
      const modifiedBooruList = nsfwSetting
        ? findBoorusWithValueByKey(true, 'nsfw', this.booruData.boorus)
        : findBoorusWithValueByKey(false, 'nsfw', this.booruData.boorus)

      return modifiedBooruList
    },

    // Changes that we have to do when changing domain so request is not malformed
    async changeDomain(domain) {
      this.booruDataManager(domain)

      await this.pidManager({ operation: 'reset' })

      this.tagManager({ operation: 'reset' })

      await this.fetchWithMode({ mode: 'posts', returnMode: 'add' })

      fireAnalytics('domain', { domain: this.getActiveBooru.domain })
    },
  },
}
</script>
