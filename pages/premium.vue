@@ -0,0 +1,172 @@
<template>
  <main class="flex h-screen">
    <template v-if="hasValidLicenseKey">
      <div class="flex flex-col w-full py-4">
        <PremiumDashboard />

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
