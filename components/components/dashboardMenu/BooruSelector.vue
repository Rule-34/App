<template>
  <div class="flex relative material-container m-0 rounded-full">
    <!-- Cloud icon -->
    <div for="domain-selector" class="inline-flex items-center pl-2 pr-1">
      <CloudIcon class="icon text-primary w-4 h-4" />
    </div>

    <!-- Selector -->
    <select
      :value="selected"
      aria-label="Selector that changes the domain where the content is pulled from"
      class="inline-flex items-center appearance-none outline-none font-light text-primary bg-elevation"
      @change="changeDomain($event.target.value)"
    >
      <!-- Loop for every option -->
      <template v-for="booru in boorus">
        <option
          :key="booru.name"
          :aria-label="'Changes the domain to ' + booru.name"
          :value="booru.short"
          v-text="booru.name"
        />
      </template>
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
import {
  booruList,
  removeBooruByShort,
  returnSafeBoorus
} from '~/assets/js/BooruTools.js'

export default {
  name: 'BooruSelector',
  components: { ChevronDownIcon, CloudIcon },

  computed: {
    ...mapState(['dashBoardSettings']),

    // Evaluate NSFW and Experimental settings and return boorus depending of the values
    boorus() {
      return this.evaluateBooruList(
        this.$store.state.userSettings.nsfw.value,
        this.dashBoardSettings.experimentalSettings
      )
    },

    selected() {
      return this.dashBoardSettings.contentDomain
    }
  },

  methods: {
    ...mapMutations(['domainManager', 'pidManager', 'tagManager']),
    ...mapActions(['fetchWithMode', 'analyticManager']),

    evaluateBooruList(nsfw, experimental) {
      // If NSFW is enabled load safe boorus
      if (!nsfw) {
        return returnSafeBoorus()


        // Else return filtered boorus
      } else {
        return removeBooruByShort(['lolibooru'])
      }
    },

    // Changes that we have to do when changing domain so request is not malformed
    changeDomain(domain) {
      // Send new API to change
      this.domainManager(domain)

      // Reset tags so we dont search those tags on new domain
      this.tagManager({ operation: 'reset' })

      // Reset PID so we dont start with specific PID on new domain, depending of the domain it starts at 0 or at 1
      this.pidManager({ operation: 'reset' })

      // And finally load the posts with everything to default
      this.fetchWithMode({ mode: 'posts', returnMode: 'add' })

      // Send analytics
      this.analyticManager('domain')
    }
  }
}
</script>
