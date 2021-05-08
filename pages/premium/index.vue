<template>
  <main
    class="flex flex-col items-center justify-center max-w-3xl min-h-screen p-4 mx-auto sm:p-6 lg:p-8"
  >
    <template v-if="isUserPremium">
      <div class="flex flex-col flex-auto w-full space-y-4">
        <!-- Dashboard -->
        <div class="p-4 material-container">
          <!-- Icon and email -->
          <div class="py-1 truncate">
            <!-- Icon -->
            <span
              class="inline-flex items-center justify-center w-10 h-10 rounded-full border-util bg-darkGray-700"
            >
              <span class="font-medium leading-none text-white">
                {{ getUserEmail.charAt(0).toUpperCase() }}
              </span>
            </span>

            <!-- Email -->
            <span class="ml-1 text-gray-200">{{ getUserEmail }}</span>
          </div>

          <!-- Status -->
          <div class="my-1 text-center">
            <p class="text-gray-300">Your subscription is</p>
            <p class="text-3xl font-semibold text-accent-400">Active</p>
          </div>

          <!-- Log out -->
          <button
            type="button"
            class="block ml-auto leading-none link"
            @click="logOut"
          >
            Log out
          </button>
        </div>

        <!-- Custom Booru  -->
        <div class="flex flex-row items-center p-4 material-container">
          <div class="flex-auto">
            <h1 class="text-lg font-medium text-gray-200">Custom Boorus</h1>
            <p class="text-gray-300">Add or edit compatible boorus</p>
          </div>

          <NuxtLink
            class="px-3 py-2 rounded-full link border-util bg-darkGray-700"
            to="/premium/custom-boorus"
          >
            Modify
          </NuxtLink>
        </div>

        <!-- Custom Tag Collections  -->
        <div class="flex flex-row items-center p-4 material-container">
          <div class="flex-grow">
            <h1 class="text-lg font-medium text-gray-200">Tag Collections</h1>
            <p class="text-gray-300">Add or edit tag collections</p>
          </div>

          <NuxtLink
            class="px-3 py-2 rounded-full link border-util bg-darkGray-700"
            to="/premium/tag-collections"
          >
            Modify
          </NuxtLink>
        </div>

        <!-- Spacer -->
        <div class="flex-grow" />

        <!-- Notice -->
        <p class="text-sm text-center text-gray-300">
          Manage your subscription on
          <a href="https://gumroad.com/library" target="_blank" class="link">
            Gumroad</a
          >.
        </p>
      </div>
    </template>

    <template v-else>
      <div class="flex flex-col flex-auto w-full justify-evenly">
        <!-- Log In -->
        <ErrorManager />

        <PremiumLogin />

        <!-- Separator -->
        <p class="text-center text-gray-300">Or</p>

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
      await this.$auth.logout()

      location.reload()
    },
  },
}
</script>
