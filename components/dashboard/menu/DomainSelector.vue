<template>
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
      class="inline-flex items-center appearance-none outline-none font-light text-primary bg-background"
      @change="changeDomain($event.target.value)"
    >
      <option
        v-for="option in options"
        :key="option.name"
        :value="option.value"
        v-text="option.name"
      />
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

export default {
  name: 'DomainSelector',
  components: { ChevronDownIcon, CloudIcon },

  data() {
    return {
      options: [
        { name: 'rule34.xxx', value: 'xxx/' },
        { name: 'rule34.paheal.net', value: 'paheal/' },
        { name: 'danbooru.donmai.us', value: 'danbooru/' },
      ],
    }
  },

  computed: {
    ...mapState(['dashBoardSettings']),
    selected() {
      return this.dashBoardSettings.contentDomain
    },
  },

  // Experimental features, dont say anything!
  mounted() {
    if (this.dashBoardSettings.experimentalSettings) {
      this.options.push({ name: 'lolibooru.moe', value: 'loli/' })
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

      // Reset PID so we dont start with specific PID on new domain, depending of the domain it starts at 0 or at 1
      switch (newApi) {
        case 'loli/':
        case 'danbooru/':
          this.pidManager({ operation: 'specific', value: 1 })
          break

        default:
          this.pidManager({ operation: 'reset' })
          break
      }

      // And finally load the posts with everything to default
      this.getPosts()

      // Send analytics
      this.analyticManager('domain')
    },
  },
}
</script>
