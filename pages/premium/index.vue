@@ -0,0 +1,172 @@
<template>
  <main class="flex h-screen">
    <template v-if="hasValidLicenseKey">
      <div class="flex flex-col w-full container--separator">
        <PremiumDashboard />

        <!-- Custom Booru  -->
        <div class="flex p-4 material-container text-default-text">
          <div class="flex-grow">
            <h1 class="text-lg">Custom Boorus</h1>
            <p class="text-sm text-default-text-muted">
              Add or edit compatible boorus
            </p>
          </div>

          <nuxt-link
            class="flex items-center justify-center px-4 rounded-full material-container bg-background"
            to="/premium/booru"
          >
            Modify
          </nuxt-link>
        </div>

        <!-- Spacer -->
        <div class="flex-grow" />

        <!-- Notice -->
        <p class="text-sm text-center text-default-text-muted">
          Manage your subscription on
          <a
            rel="noopener nofollow"
            target="_blank"
            href="https://gumroad.com/library"
          >
            Gumroad
          </a>
        </p>
      </div>
    </template>

    <template v-else>
      <div class="w-full m-auto">
        <!-- Log In -->
        <errors />

        <login />

        <!-- Separator -->
        <p class="leading-loose text-center text-default-text">Or</p>

        <subscription />
      </div>
    </template>
  </main>
</template>

<script>
import { mapGetters } from 'vuex'

// Components
import Login from '@/components/pages/premium/Login'
import Subscription from '@/components/pages/premium/Subscription'
import PremiumDashboard from '@/components/pages/premium/PremiumDashboard'

import Errors from '~/components/utils/Errors.vue'

export default {
  components: { Login, Subscription, Errors, PremiumDashboard },

  computed: {
    ...mapGetters('premium', ['hasValidLicenseKey']),
  },

  head() {
    return {
      title: 'Premium',
      meta: [
        {
          hid: 'premium',
          name: 'description',
          content: 'Premium subscription for the Rule 34 App',
        },
      ],
    }
  },
}
</script>
