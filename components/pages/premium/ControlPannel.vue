<template>
  <div class="flex flex-col">
    <div class="p-4 material-container text-default-text">
      <!-- Icon and email -->
      <div class="py-1 truncate">
        <!-- Icon -->
        <span
          class="inline-flex items-center justify-center w-10 h-10 border rounded-full shadow border-depth bg-background"
        >
          <span class="font-medium leading-none">
            {{ getUserEmail.charAt(0).toUpperCase() }}
          </span>
        </span>

        <!-- Email -->
        <span class="ml-1">{{ getUserEmail }}</span>
      </div>

      <!-- Remaining -->
      <div class="my-4 text-center">
        <p class="text-sm text-default-text-muted">
          Your subscription is
        </p>
        <p class="text-3xl font-semibold text-gradient-one">
          {{ isUserPremium ? 'Active' : 'Not active' }}
        </p>
      </div>

      <!-- Log out -->
      <button
        type="button"
        class="block ml-auto leading-none color-util"
        @click="logOut()"
      >
        Log out
      </button>
    </div>

    <!-- Spacer -->
    <div class="flex-grow" />

    <!-- Notice -->
    <p class="py-4 text-sm text-center text-default-text-muted">
      Manage your subscription on
      <a
        rel="noopener nofollow"
        target="_blank"
        href="https://gumroad.com/library"
        >Gumroad</a
      >
    </p>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ControlPannel',

  computed: {
    ...mapGetters('premium', ['isUserPremium', 'getUserEmail']),
  },

  methods: {
    logOut() {
      localStorage.removeItem('premium')

      location.reload()
    },
  },
}
</script>
