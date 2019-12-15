<template>
  <div class="m-5">
    <!-- Domain selector -->
    <div
      class="inline-flex w-fit-content relative theme-responsive-container rounded-full shadow bg-background overflow-hidden"
    >
      <!-- Cloud icon -->
      <div for="domain-selector" class="inline-flex items-center pl-2 pr-1">
        <CloudIcon class="icon text-primary w-4 h-4" />
      </div>

      <!-- Selector -->
      <select
        :value="selected"
        @change="changeDomain($event.target.value)"
        class="inline-flex items-center appearance-none outline-none font-light text-primary bg-background"
      >
        <option
          v-for="option in options"
          :value="option.value"
          v-text="option.name"
          :key="option.name"
        />
      </select>

      <!-- Drop icon -->
      <div class="inline-flex items-center pl-1 pr-2">
        <ChevronDownIcon class="icon text-default w-4 h-4" />
      </div>
    </div>

    <!-- Anything else -->
    <!--  -->
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'
import { ChevronDownIcon, CloudIcon } from 'vue-feather-icons'

export default {
  name: 'DashBoardSettings',
  components: { ChevronDownIcon, CloudIcon },

  data() {
    return {
      options: [
        { name: 'rule34.xxx', value: 'xxx/' },
        { name: 'rule34.paheal.net', value: 'paheal/' },
      ],
    }
  },

  // Get data() from vuex stores
  computed: {
    ...mapState(['dashBoardSettings']),
    selected() {
      return this.dashBoardSettings.contentDomain
    },
  },

  // Experimental features, dont say anything!
  mounted() {
    if (this.dashBoardSettings.experimentalSettings) {
      this.options.push(
        { name: 'lolibooru.moe', value: 'loli/' },
        { name: 'rule34hentai.net', value: 'hentai/' }
      )
    }
  },

  methods: {
    ...mapMutations(['domainManager', 'pidManager', 'tagManager']),
    ...mapActions(['getPosts', 'analyticManager']),

    // Changes that we have to do when changing domain so request is not malformed
    changeDomain(newApi) {
      // Send new API to change
      this.domainManager(newApi)
      // Reset tags so we dont search those tags on new domain
      this.tagManager({ operation: 'reset' })
      // Reset PID so we dont start with specific PID on new domain
      this.pidManager({ operation: 'reset' })
      // And finally load the posts with everything to default
      this.getPosts()
      // Send analytics
      this.analyticManager('domain')
    },
  },
}
</script>
