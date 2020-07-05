<template>
  <div class="material-container text-default-text p-4">
    <form action="#" method="POST">
      <label
        class="block text-lg font-medium leading-tight mb-2"
        for="license-key"
      >
        License Key
      </label>

      <div class="w-full flex items-center mt-1">
        <input
          id="license-key"
          class="appearance-none outline-none block flex-grow w-10/12 font-light bg-background border border-border rounded-md p-2 shadow-sm text-sm"
          placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
          type="text"
          name="license-key"
          required
        />

        <!-- Action -->
        <button
          type="submit"
          class="appearance-none bg-gradient-blue-lilac border-0 rounded-full ml-1 shadow-md"
        >
          <chevron-right-icon class="icon text-default w-9 h-9" />
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ChevronRightIcon } from 'vue-feather-icons'

export default {
  name: 'Login',

  components: {
    ChevronRightIcon,
  },
}
</script>
