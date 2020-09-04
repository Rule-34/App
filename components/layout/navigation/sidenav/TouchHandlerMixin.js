import { mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapGetters('navigation', ['isSideNavActive', 'isSearchActive']),
  },

  methods: {
    ...mapMutations('navigation', ['setSideNavIsActive', 'setSearchIsActive']),

    touchHandler(direction, event) {
      const touchThreshold = screen.availWidth * 0.25
      // console.log(touchThreshold, event)

      switch (direction) {
        case 'right':
          if (event.touchstartX > touchThreshold) {
            console.debug('Insufficient touch threshold')
            return
          }

            this.setSearchIsActive(false)
          if (this.isSearchActive && this.isPostsPage) {
          } else {
            this.setSideNavIsActive(true)
          }
          break

        case 'left':
          if (event.touchstartX < screen.availWidth - touchThreshold) {
            console.debug('Insufficient touch threshold')
            return
          }

            this.setSearchIsActive(true)
          if (!this.isSideNavActive && this.isPostsPage) {
          } else {
          }
          break
      }
    },
  },
}
