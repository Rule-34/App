import { mapActions, mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters('navigation', ['isSideNavActive', 'isSearchActive'])
  },

  watch: {
    $route: {
      immediate: true,

      handler(value, oldValue) {
        this.routeHandler()
      }
    }
  },

  mounted() {
    this.routeHandler()
  },

  methods: {
    ...mapActions('navigation', [
      'sideNavNavigationManager',
      'searchNavigationManager'
    ]),

    routeHandler() {
      // Close Side Nav on route change
      if (this.isSideNavActive)
        this.sideNavNavigationManager({ operation: 'set', value: false })

      // Close Search on route change
      if (this.isSearchActive)
        this.searchNavigationManager({ operation: 'set', value: false })
    }
  }
}
