<template>
  <!-- Icon -->
  <div class="relative rounded-full shadow border-util bg-elevation">
    <!-- Button -->
    <button
      type="button"
      class="flex p-1"
      aria-label="Notifications"
      @click="toggleNotifications()"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        viewBox="0 0 24 24"
        class="w-5 h-5"
      >
        <g fill="none">
          <!-- Notification bell -->
          <path
            class="fill-current icon text-default-text-muted"
            d="M15 19a3 3 0 11-6 0h6zm3.13-2H5.87C4.838 17 4 16.105 4 15c0-.348.085-.69.246-.992L6.388 10V8C6.388 4.686 8.9 2 12 2s5.611 2.686 5.611 6v2l2.142 4.008c.513.959.201 2.18-.696 2.728a1.778 1.778 0 01-.928.264z"
          />

          <!-- Only show if theres a new notification -->
          <g v-if="isThereANewNotification">
            <!-- Bell with a little cut -->
            <path
              class="fill-current icon text-default-text-muted"
              d="M12.338 2.01a6 6 0 005.274 7.977V10l2.141 4.008c.513.959.201 2.18-.696 2.728a1.778 1.778 0 01-.928.264H5.871C4.837 17 4 16.105 4 15c0-.348.085-.69.246-.992L6.388 10V8C6.388 4.686 8.9 2 12 2c.113 0 .226.004.338.01zM15 19a3 3 0 11-6 0h6z"
            />
            <!-- Notification dot -->
            <circle
              cx="18"
              cy="4.25"
              r="4"
              stroke="hsla(205, 78%, 62%, 0.3)"
              class="fill-current icon text-primary"
            />
          </g>
        </g>
      </svg>
    </button>

    <!-- Content -->
    <transition name="page">
      <aside v-if="isActive" class="notifications--details">
        <!-- Repeat for every notification -->
        <ContentContainer
          v-for="notification in getNotifications"
          :key="notification.title"
          class="m-1"
          :title="notification.title"
          :text="notification.text"
          :links="notification.links"
        />
        <!-- TODO: redo this -->
      </aside>
    </transition>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'

// Components
import ContentContainer from '~/components/utils/ContentContainer.vue'

// JS
import fireAnalytics from '~/assets/js/analytics'

export default {
  name: 'Notifications',

  components: { ContentContainer },

  data() {
    return {
      isActive: false,
    }
  },

  computed: {
    ...mapGetters('notifications', [
      'getNotifications',
      'hasNotificationsBeenFetched',
      'isThereANewNotification',
    ]),
  },

  mounted() {
    if (this.hasNotificationsBeenFetched) {
      console.debug('Already fetched notifications, skipping...')
      return
    }

    this.fetchNotifications()
  },

  methods: {
    ...mapMutations('notifications', ['setLatestTitle']),
    ...mapActions('notifications', ['fetchNotifications']),

    toggleNotifications() {
      this.isActive = !this.isActive

      if (this.isActive) {
        this.setLatestTitle(this.getNotifications[0].title)

        fireAnalytics('notifications')
      }
    },
  },
}
</script>

<style lang="postcss">
.notifications--details {
  /* Offset a little so its more natural */
  top: 120%;
  right: -15px;

  /* Width */
  min-width: 80vw;

  @apply absolute z-10 overflow-hidden;
}

@screen md {
  .notifications--details {
    min-width: 20vw;
  }
}
</style>
