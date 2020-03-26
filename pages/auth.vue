<template>
  <main class="flex flex-col h-screen p-3">
    <template v-if="!patronCredentials.full_name">
      <button
        class="color-util border-util bg-elevation rounded-full py-2 px-4 mt-3"
        v-text="'Login with Patreon'"
      />
    </template>

    <!-- If user is authenticated -->
    <template v-else>
      <!-- User card -->
      <div
        class="material-container overflow-visible text-default-text p-3 mt-20 relative"
      >
        <!-- Image -->
        <div
          class="absolute -top-14 h-28 w-28 md:-top-16 md:h-32 md:w-32 inset-x-0 mx-auto bg-background border-util rounded-full overflow-hidden"
        >
          <img
            :src="patronCredentials.image_url"
            alt="User image"
            class="w-full h-auto"
          />
        </div>
        <!-- Name -->
        <div class="text-center mt-14 md:mt-16">
          <h3
            class="text-lg md:text-2xl"
            v-text="patronCredentials.full_name"
          />
        </div>

        <div>
          <h3>Tier</h3>
          <h3>Subscriber since</h3>
        </div>
      </div>

      <!-- Log out -->
      <div class="ml-auto mr-5">
        <button
          class="color-util border-util bg-elevation rounded-full py-2 px-4 mt-3"
          @click="patronManager({ mode: 'reset' })"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="icon h-5 w-5 text-default inline -mt-1"
          >
            <path
              d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
            />
          </svg>

          Log out
        </button>
      </div>
    </template>
  </main>
</template>

<script>
import { mapActions, mapState, mapMutations } from 'vuex'

export default {
  data() {
    return {
      // Declare url if we are in development or not
      REDIRECT_URL:
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:8000/oauth/redirect'
          : 'https://rule-34-api.herokuapp.com/oauth/redirect',
    }
  },

  computed: {
    ...mapState(['patronCredentials']),
  },

  mounted() {
    // Save credentials to state

    // If there are query parameters
    if (
      this.$route.query.token &&
      this.$route.query.refresh_token &&
      this.$route.query.expires_in
    ) {
      // Send credentials to state
      this.patreonManager({
        mode: 'setCredentials',
        token: this.$route.query.token,
        refresh_token: this.$route.query.refresh_token,
        expires_in: this.$route.query.expires_in,
      })

      // Remove query parameters from url
      this.$router.push({ path: this.$route.path })

      // Get data about the user and save it to state
      this.fetchWithMode({ mode: 'patreon' })
    }
  },

  methods: {
    ...mapMutations(['patronManager']),
    ...mapActions(['fetchWithMode']),
  },

  head() {
    return {
      title: 'Auth',
      meta: [
        {
          hid: 'usage',
          name: 'description',
          content: 'Authenticate to the Rule 34 App with Patreon.',
        },
      ],
    }
  },
}
</script>
