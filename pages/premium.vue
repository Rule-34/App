@@ -0,0 +1,172 @@
<template>
  <main>
    <!-- Log In -->
    <div
      v-if="!isUserPremium"
      class="grid min-h-screen"
      style="place-items: center;"
    >
      <div class="w-full max-w-screen-sm">
        <!-- Log In form -->
        <login />

        <!-- Separator -->
        <p class="leading-loose text-center text-default-text">Or</p>

        <!-- Subscription  -->
        <subscription />
      </div>
    </div>

    <!-- Control pannel -->
    <ControlPannel v-else class="h-full min-h-screen mx-auto" />
  </main>
</template>

<script>
import { mapGetters } from 'vuex'
import Login from '@/components/pages/premium/Login'
import Subscription from '@/components/pages/premium/Subscription'
import ControlPannel from '@/components/pages/premium/ControlPannel'

export default {
  components: { Login, Subscription, ControlPannel },

  computed: {
    ...mapGetters('premium', ['isUserPremium']),
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
