<template>
  <div>
    <!-- Domain selector -->
    <div
      class="inline-flex w-fit-content relative theme-responsive-container rounded-full shadow bg-background overflow-hidden"
    >
      <!-- Cloud icon -->
      <div for="domain-selector" class="inline-flex items-center p-1">
        <BellIcon class="icon text-primary w-6 h-6" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'
import { BellIcon } from 'vue-feather-icons'

export default {
  name: 'Notifications',
  components: { BellIcon },

  computed: {
    ...mapState(['dashBoardSettings']),
    selected() {
      return this.dashBoardSettings.contentDomain
    },
  },

  // Experimental features, dont say anything!

  methods: {
    ...mapMutations(['domainManager', 'pidManager', 'tagManager']),
    ...mapActions(['getPosts', 'analyticManager']),
  },
}
</script>
