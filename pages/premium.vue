@@ -0,0 +1,172 @@
<template>
  <main class="grid h-screen" style="place-items: center;">
    <!-- Log In -->
    <div v-if="!isUserPremium" class="w-full max-w-screen-sm">
      <!-- Log In form -->
      <login />

      <!-- Separator -->
      <p class="text-default-text leading-loose text-center">Or</p>

      <!-- Subscription  -->
      <subscription />
    </div>

    <!-- Control pannel -->
    <div v-else>
      <h1 class="text-default-text text-center text-lg">
        Control pannel
      </h1>
    </div>
  </main>
</template>

<script>
import { mapGetters } from 'vuex'
import Login from '@/components/pages/premium/Login'
import Subscription from '@/components/pages/premium/Subscription'

export default {
  components: { Login, Subscription },

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
