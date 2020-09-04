import { mapGetters, mapActions } from 'vuex'

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
    ...mapGetters('navigation', ['isSideNavActive', 'isSearchActive']),
  },

  methods: {
    ...mapMutations('navigation', ['setSideNavIsActive', 'setSearchIsActive']),

    routeHandler() {
      // Close Side Nav on route change
      if (this.isSideNavActive)

      // Close Search on route change
      if (this.isSearchActive)

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
