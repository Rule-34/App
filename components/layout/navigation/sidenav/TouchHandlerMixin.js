import { mapActions, mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters('navigation', ['isSideNavActive', 'isSearchActive']),
  },

  methods: {
    ...mapActions('navigation', [
      'sideNavNavigationManager',
      'searchNavigationManager',
    ]),

    touchHandler(direction, event) {
      const touchThreshold = screen.availWidth * 0.25
      // console.debug(touchThreshold, event)

      switch (direction) {
        case 'right':
          if (event.touchstartX > touchThreshold) {
            // console.debug('Insufficient touch threshold')
            return
          }

          if (this.isSearchActive && this.isPostsPage) {
            this.searchNavigationManager({
              operation: 'set',
              value: false,
            })
          } else {
            this.sideNavNavigationManager({
              operation: 'set',
              value: true,
            })
          }
          break

        case 'left':
          if (event.touchstartX < screen.availWidth - touchThreshold) {
            // console.debug('Insufficient touch threshold')
            return
          }

          if (!this.isSideNavActive && this.isPostsPage) {
            this.searchNavigationManager({
              operation: 'set',
              value: true,
            })
          } else {
            this.sideNavNavigationManager({
              operation: 'set',
              value: false,
            })
          }
          break
      }
    },
  },
}
