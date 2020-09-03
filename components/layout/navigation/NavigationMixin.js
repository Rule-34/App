import { mapState, mapMutations } from 'vuex'

export default {
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

  data() {
    return { isPostsPage: false }
  },

  computed: {
    ...mapState('navigation', ['sideNav', 'search']),
  },

  methods: {
    ...mapMutations('navigation', ['setSideNavIsActive', 'setSearchIsActive']),

    routeHandler() {
      // Close Side Nav on route change
      if (this.sideNav.isActive) this.setSideNavIsActive(false)

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
