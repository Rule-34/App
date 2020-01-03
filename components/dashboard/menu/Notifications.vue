<template>
  <!-- Container -->
  <div
    class="inline-flex items-center relative overflow-hidden cursor-pointer"
    @click="notification++"
  >
    <!-- Icon -->
    <div class="theme-responsive-container rounded-full shadow bg-background ">
      <BellIcon class="icon text-primary w-5 h-5 m-2" />
    </div>

    <!-- Number of notifications -->
    <div
      class="absolute top-0 right-0 mr-2 -mt-1 text-sm text-primary select-none"
      v-text="notification"
    />
  </div>
</template>

<script>
import { BellIcon } from 'vue-feather-icons'

export default {
  name: 'Notifications',
  components: { BellIcon },

  data() {
    return {
      notification: 0,
    }
  },
}
</script>
