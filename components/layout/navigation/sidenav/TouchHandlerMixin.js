import { mapState, mapMutations } from 'vuex'

export default {
  computed: {
    ...mapState('navigation', ['sideNav', 'search']),
  },

  methods: {
    ...mapMutations('navigation', ['setSideNavActive', 'setSearchActive']),

    touchHandler(direction, event) {
      const touchThreshold = screen.availWidth * 0.25
      // console.log(touchThreshold, event)

      switch (direction) {
        case 'right':
          if (event.touchstartX > touchThreshold) {
            console.debug('Insufficient touch threshold')

            return
          }

          if (this.search.isActive && this.isPostsPage) {
            this.setSearchActive(false)
          } else {
            this.setSideNavActive(true)
          }
          break

        case 'left':
          if (event.touchstartX < screen.availWidth - touchThreshold) {
            console.debug('Insufficient touch threshold')
            return
          }

          if (!this.sideNav.isActive && this.isPostsPage) {
            this.setSearchActive(true)
          } else {
            this.setSideNavActive(false)
          }
          break
      }
    },
  },
}
