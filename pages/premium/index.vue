@@ -0,0 +1,172 @@
<template>
  <main
    class="flex flex-col items-center justify-center max-w-3xl min-h-screen p-4 mx-auto sm:p-6 lg:p-8"
  >
    <template v-if="isUserPremium">
      <div class="flex flex-col flex-auto w-full space-y-4">
        <!-- Dashboard -->
        <div class="p-4 rounded-container text-default-text">
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

          <!-- Status -->
          <div class="my-4 text-center">
            <p class="text-sm text-default-text-muted">Your subscription is</p>
            <p class="text-3xl font-semibold text-gradient-one">Active</p>
          </div>

          <!-- Log out -->
          <button
            type="button"
            class="block ml-auto leading-none color-util"
            @click="logOut"
          >
            Log out
          </button>
        </div>

        <!-- Custom Booru  -->
        <div class="flex p-4 rounded-container text-default-text">
          <div class="flex-auto">
            <h1>Custom Boorus</h1>
            <p class="text-sm text-default-text-muted">
              Add or edit compatible boorus
            </p>
          </div>

          <NuxtLink
            class="flex items-center justify-center px-4 transition-colors duration-300 border rounded-full shadow border-border bg-background hover:border-border-hover"
            to="/premium/booru"
          >
            Modify
          </NuxtLink>
        </div>

        <!-- Custom Tag Collections  -->
        <div class="flex p-4 rounded-container text-default-text">
          <div class="flex-grow">
            <h1>Custom Tag Collections</h1>
            <p class="text-sm text-default-text-muted">
              Add or edit tag collections
            </p>
          </div>

          <NuxtLink
            class="flex items-center justify-center px-4 transition-colors duration-300 border rounded-full shadow border-border bg-background hover:border-border-hover"
            to="/premium/tags"
          >
            Modify
          </NuxtLink>
        </div>

        <!-- Spacer -->
        <div class="flex-grow" />

        <!-- Notice -->
        <p class="text-sm text-center text-default-text-muted">
          Manage your subscription on
          <a rel="noopener" target="_blank" href="https://gumroad.com/library">
            Gumroad
          </a>
        </p>
      </div>
    </template>

    <template v-else>
      <div class="flex flex-col flex-auto w-full justify-evenly">
        <!-- Log In -->
        <ErrorManager />

        <PremiumLogin />

        <!-- Separator -->
        <p class="leading-loose text-center text-default-text-muted">Or</p>

        <PremiumSubscription />
      </div>
    </template>
  </main>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  head() {
    return {
      title: 'Premium',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: 'Premium subscription.',
        },
      ],
    }
  },

  computed: {
    ...mapGetters('premium', ['isUserPremium', 'getUserEmail']),
  },

  methods: {
    async logOut() {
      localStorage.removeItem('premium')

      await this.$auth.logout()

      location.reload()
    },
  },
}
</script>
