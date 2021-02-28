<template>
  <!-- Icon -->
  <div class="rounded-full shadow border-util bg-elevation">
    <!-- Button -->
    <button
      type="button"
      class="flex p-1"
      aria-label="Toggle notification menu"
      @click="toggleNotifications"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        viewBox="0 0 24 24"
        class="w-5 h-5 icon"
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

    <!-- 
    This should use Vue 3's teleport feature
    https://v3.vuejs.org/guide/teleport.html
    -->
    <!-- Notification menu -->
    <transition name="notifications">
      <aside v-if="isActive" class="fixed inset-0 z-10 overflow-hidden">
        <div class="absolute inset-0 overflow-hidden">
          <!-- Background -->
          <div
            class="absolute inset-0 transition-opacity bg-black bg-opacity-25"
            aria-hidden="true"
            @click="toggleNotifications"
          ></div>

          <section
            class="absolute inset-y-0 right-0 flex max-w-full pl-10"
            aria-labelledby="slide-over-heading"
          >
            <div class="w-screen max-w-md">
              <div
                class="flex flex-col h-full py-6 overflow-y-scroll shadow-xl bg-background"
              >
                <div class="px-4 sm:px-6">
                  <div class="flex items-start justify-between">
                    <h2
                      id="slide-over-heading"
                      class="text-lg font-medium text-default-text"
                    >
                      Notifications
                    </h2>
                    <div class="flex items-center ml-3 h-7">
                      <button
                        class="p-1 rounded-full text-default border-util bg-elevation focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        @click="toggleNotifications"
                      >
                        <span class="sr-only">Close panel</span>
                        <!-- Heroicon name: outline/x -->
                        <svg
                          class="w-6 h-6"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <ul class="relative flex-1 px-4 mt-3 space-y-2 sm:px-6">
                  <!-- Replace with your content -->
                  <template v-if="!getNotifications">
                    <ContentContainer
                      title="Notifications"
                      text="There are no notifications available."
                    />
                  </template>

                  <template v-else>
                    <ContentContainer
                      v-for="notification in getNotifications"
                      :key="notification.title"
                      :title="notification.title"
                      :text="notification.text"
                      :links="notification.links"
                    />
                  </template>
                  <!-- /End replace -->
                </ul>
              </div>
            </div>
          </section>
        </div>
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

      if (this.isActive && this.getNotifications) {
        this.setLatestTitle(this.getNotifications[0].title)

        // fireAnalytics('notifications')
      }
    },
  },
}
</script>

<style lang="postcss">
/* 
      Slide-over panel, show/hide based on slide-over state.

        Entering: "transform transition ease-in-out duration-500 sm:duration-700"
          From: "translate-x-full"
          To: "translate-x-0"
        Leaving: "transform transition ease-in-out duration-500 sm:duration-700"
          From: "translate-x-0"
          To: "translate-x-full" 
*/

.notifications-enter-active,
.notifications-leave-active {
  @apply transform transition ease-in-out duration-300;
}

.notifications-enter,
.notifications-leave-to {
  @apply translate-x-full;
}

.notifications-enter-to,
.notifications-leave {
  @apply translate-x-0;
}
</style>
