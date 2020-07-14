@@ -0,0 +1,172 @@
<template>
  <main class="flex h-screen">
    <template v-if="hasValidLicenseKey">
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
import ControlPannel from '@/components/pages/premium/ControlPannel'

import Errors from '~/components/utils/Errors.vue'

export default {
  components: { Login, Subscription, Errors, ControlPannel },

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
