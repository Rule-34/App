<template>
  <main class="flex flex-col h-screen p-3">
    <template v-if="!patreonCredentials.full_name">
      <!-- URI to Patreon's OAuth2 -->
      <a
        class="m-auto"
        :href="`https://www.patreon.com/oauth2/authorize\
?response_type=code\
&client_id=BR4HkEO0iVPQuQuVdqMzSY_XaTNS0PA_u8BWCLUswjy9dRJ0ZRlasuEf3puxrhTP\
&redirect_uri=${REDIRECT_URL}`"
      >
        <button
          class="color-util border-util bg-elevation rounded-full py-2 px-4 mt-3"
          v-text="'Login with Patreon'"
        />
      </a>
    </template>

    <!-- If user is authenticated -->
    <template v-else>
      <div class="material-container text-default-text flex flex-wrap p-3">
        <img
          :src="patreonCredentials.image_url"
          alt="User image"
          class="h-12 w-12"
        />
        <h3
          class="text-lg my-auto sm:ml-2"
          v-text="patreonCredentials.full_name"
        />
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
    ...mapState(['patreonCredentials']),
  },

  mounted() {
    // Save credentials to state

    // If there are query parameters
    if (
      this.$route.query.access_token &&
      this.$route.query.refresh_token &&
      this.$route.query.expires_in
    ) {
      // Send credentials to state
      this.patreonManager({
        mode: 'setCredentials',
        access_token: this.$route.query.access_token,
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
    ...mapMutations(['patreonManager']),
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
