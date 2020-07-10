import { mapState, mapMutations } from 'vuex'

export default {
  computed: {
    ...mapState(['searchData']),
  },

  methods: {
    ...mapMutations(['sideNavManager', 'searchManager']),

    touchHandler(direction, event) {
      const touchThreshold = screen.availWidth * 0.25
      // console.log(touchThreshold, event)

      switch (direction) {
        case 'right':
          if (event.touchstartX > touchThreshold) {
            console.debug('Insufficient touch threshold')

            return
          }

          if (this.searchData.isActive && this.isDashboard) {
            this.searchManager({ mode: 'setSearch', data: false })
          } else {
            this.sideNavManager('open')
          }
          break

        case 'left':
          if (event.touchstartX < screen.availWidth - touchThreshold) {
            console.debug('Insufficient touch threshold')
            return
          }

          if (!this.sideNavData.isActive && this.isDashboard) {
            this.searchManager({ mode: 'setSearch', data: true })
          } else {
            this.sideNavManager('close')
          }
          break
      }
    },
  },
}
