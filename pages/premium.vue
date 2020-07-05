@@ -0,0 +1,172 @@
<template>
  <main class="h-screen flex flex-col">
    <div class="my-auto">
      <!-- Log In form -->
      <login />

      <!-- Separator -->
      <p class="text-default-text leading-loose text-center">Or</p>

      <!-- Subscription  -->
      <subscription />
    </div>
  </main>
</template>

<script>
import Login from '@/components/pages/premium/Login'
import Subscription from '@/components/pages/premium/Subscription'

export default {
  components: { Login, Subscription },

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
