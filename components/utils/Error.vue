<template>
  <div
    class="p-2 m-6 text-center text-default-text"
    :class="{ 'rounded-container': renderBorders }"
  >
    <!-- Header -->
    <div>
      <h1
        class="px-2 mx-auto mb-1 text-2xl font-bold tracking-wide border w-max-content"
      >
        {{ errorTitle }}
      </h1>
    </div>

    <!-- Body -->
    <div>
      <p>
        {{ errorData }}
      </p>
    </div>

    <!-- Action -->
    <div v-if="showAction">
      <slot name="customAction">
        <!-- Fallback -->
        <button type="button" class="color-util" @click="reload()">
          Reload the page?
        </button>
      </slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    errorTitle: {
      type: String,
      default: 'Error',
    },

    errorData: {
      type: String,
      default: 'Something went wrong',
    },

    showAction: {
      type: Boolean,
      default: true,
    },

    renderBorders: {
      type: Boolean,
      default: true,
    },
  },

  methods: {
    reload() {
      location.reload()
    },
  },
}
</script>
