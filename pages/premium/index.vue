@@ -0,0 +1,172 @@
<template>
  <main>
    <template v-if="hasValidLicenseKey">
      <div class="flex flex-col h-screen space-y-4 space-y-4-fixer">
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

        <!-- Custom Tag Collections  -->
        <div class="flex p-4 material-container text-default-text">
          <div class="flex-grow">
            <h1 class="text-lg">Custom Tag Collections</h1>
            <p class="text-sm text-default-text-muted">
              Add or edit tag collections
            </p>
          </div>

          <nuxt-link
            class="flex items-center justify-center px-4 rounded-full material-container bg-background"
            to="/premium/tags"
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
      <div class="flex flex-col h-screen m-auto justify-evenly">
        <!-- Log In -->
        <ErrorManager />

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

import ErrorManager from '~/components/utils/ErrorManager.vue'

export default {
  components: { Login, Subscription, ErrorManager, PremiumDashboard },

  computed: {
    ...mapGetters('premium', ['hasValidLicenseKey']),
  },

  head() {
    return {
      title: 'Premium',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: 'Premium subscription for the Rule 34 App',
        },
      ],
    }
  },
}
</script>
