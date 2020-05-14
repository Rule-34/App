<template>
  <div class="flex relative material-container m-0 rounded-full">
    <!-- Cloud icon -->
    <div for="domain-selector" class="inline-flex items-center pl-2 pr-1">
      <CloudIcon class="icon text-primary w-4 h-4" />
    </div>

    <!-- Selector -->
    <select
      :value="booruData.active.domain"
      aria-label="Selector that changes the domain where the content is pulled from"
      class="inline-flex items-center appearance-none outline-none font-light text-primary bg-elevation"
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
      <ChevronDownIcon class="icon text-default w-4 h-4" />
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'

// Third party
import { ChevronDownIcon, CloudIcon } from 'vue-feather-icons'

// Components
import { findBoorusWithValueByKey } from '~/assets/lib/rule-34-shared-resources/util/BooruUtils.js'

import fireAnalytics from '~/assets/js/analytics'

export default {
  name: 'BooruSelector',
  components: { ChevronDownIcon, CloudIcon },

  computed: {
    ...mapState(['booruData', 'userSettings', 'credentials']),

    // Evaluate NSFW and Experimental settings and return boorus depending of the values
    boorus() {
      return this.evaluateBooruList(
        this.userSettings.nsfw.value,
        this.credentials.isPatron
      )
    },
  },

  methods: {
    ...mapMutations(['booruDataManager', 'tagManager']),
    ...mapActions(['fetchWithMode']),

    evaluateBooruList(nsfwSetting, isPatron) {
      // If NSFW is enabled return NSFW only boorus and vice-versa
      let modifiedBooruList = nsfwSetting
        ? findBoorusWithValueByKey(true, 'nsfw', this.booruData.boorus)
        : findBoorusWithValueByKey(false, 'nsfw', this.booruData.boorus)

      // If user is Patron return custom boorus
      modifiedBooruList = isPatron
        ? findBoorusWithValueByKey(true, 'patronOnly', modifiedBooruList)
        : modifiedBooruList

      return modifiedBooruList
    },

    // Changes that we have to do when changing domain so request is not malformed
    async changeDomain(domain) {
      // Set domain, type and initial PID
      this.booruDataManager(domain)

      // Reset tags so we dont search those tags on new domain
      this.tagManager({ operation: 'reset' })

      // And finally load the posts with everything to default
      await this.fetchWithMode({ mode: 'posts', returnMode: 'add' })

      // Send analytics
      fireAnalytics('booru', this.$store.state)
    },
  },
}
</script>
