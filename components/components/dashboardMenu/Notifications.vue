<template>
  <!-- Container -->
  <div
    class="inline-flex items-center relative overflow-hidden cursor-pointer"
    @click="notification++"
  >
    <!-- Icon -->
    <div class="color-util border-util rounded-full shadow bg-elevation">
      <!-- <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <g fill="none">
          <path
            class="icon--read"
            fill="#A3A9AC"
            d="M15 19a3 3 0 11-6 0h6zm3.13-2H5.87C4.838 17 4 16.105 4 15c0-.348.085-.69.246-.992L6.388 10V8C6.388 4.686 8.9 2 12 2s5.611 2.686 5.611 6v2l2.142 4.008c.513.959.201 2.18-.696 2.728a1.778 1.778 0 01-.928.264z"
          ></path>
          <g class="icon--unread">
            <path
              fill="#A3A9AC"
              d="M12.338 2.01a6 6 0 005.274 7.977V10l2.141 4.008c.513.959.201 2.18-.696 2.728a1.778 1.778 0 01-.928.264H5.871C4.837 17 4 16.105 4 15c0-.348.085-.69.246-.992L6.388 10V8C6.388 4.686 8.9 2 12 2c.113 0 .226.004.338.01zM15 19a3 3 0 11-6 0h6z"
            ></path>
            <circle cx="18" cy="4.25" r="4" fill="#FA3946"></circle>
          </g>
        </g>
      </svg> -->
    </div>

    <!-- Number of notifications -->
    <div
      class="absolute top-0 right-0 mr-2 -mt-1 text-sm text-primary select-none"
      v-text="notification"
    />
  </div>
</template>

<script>
export default {
  name: 'Notifications',

  data() {
    return {
      notification: 0
    }
  }
}
</script>
