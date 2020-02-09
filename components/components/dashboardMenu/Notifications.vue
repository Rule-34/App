<template>
  <!-- Icon -->
  <div
    class="border-util rounded-full shadow bg-elevation p-1"
    @click="notifications = !notifications"
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
          class="icon fill-current text-default-text-muted"
          d="M15 19a3 3 0 11-6 0h6zm3.13-2H5.87C4.838 17 4 16.105 4 15c0-.348.085-.69.246-.992L6.388 10V8C6.388 4.686 8.9 2 12 2s5.611 2.686 5.611 6v2l2.142 4.008c.513.959.201 2.18-.696 2.728a1.778 1.778 0 01-.928.264z"
        />
        <g v-if="notifications">
          <!-- Bell with a little cut -->
          <path
            class="icon fill-current text-default-text-muted"
            d="M12.338 2.01a6 6 0 005.274 7.977V10l2.141 4.008c.513.959.201 2.18-.696 2.728a1.778 1.778 0 01-.928.264H5.871C4.837 17 4 16.105 4 15c0-.348.085-.69.246-.992L6.388 10V8C6.388 4.686 8.9 2 12 2c.113 0 .226.004.338.01zM15 19a3 3 0 11-6 0h6z"
          />
          <!-- Notification dot -->
          <circle
            cx="18"
            cy="4.25"
            r="5"
            stroke="hsla(205, 78%, 62%, 0.3)"
            class="icon fill-current text-primary"
          />
        </g>
      </g>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'Notifications',

  data() {
    return {
      notifications: true
    }
  }
}
</script>
