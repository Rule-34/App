import { mapGetters, mapActions } from 'vuex'

export default {
  data() {
    return { isPostsPage: false }
  },

  computed: {
    ...mapGetters('navigation', ['isSideNavActive', 'isSearchActive']),
  },

  watch: {
    $route() {
      // console.log('route changed', this.$route)
      // console.log(this.$nuxt.$route.name)

      this.routeHandler()
    },
  },

  mounted() {
    this.routeHandler()
  },

  methods: {
    ...mapActions('navigation', [
      'sideNavNavigationManager',
      'searchNavigationManager',
    ]),

    routeHandler() {
      // Close Side Nav on route change
      if (this.isSideNavActive)
        this.sideNavNavigationManager({ operation: 'set', value: false })

      // Close Search on route change
      if (this.isSearchActive)
        this.searchNavigationManager({ operation: 'set', value: false })

      // Set different layout depending of the route
      switch (this.$nuxt.$route.name) {
        case 'index':
          this.isPostsPage = true
          break

        default:
          this.isPostsPage = false
          break
      }
    },
  },
}
