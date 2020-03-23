<template>
  <main>
    <a
      :href="`https://www.patreon.com/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URL}`"
      >Login with Patreon</a
    >
  </main>
</template>

<script>
export default {
  data() {
    return {
      CLIENT_ID:
        'BR4HkEO0iVPQuQuVdqMzSY_XaTNS0PA_u8BWCLUswjy9dRJ0ZRlasuEf3puxrhTP',
      REDIRECT_URL:
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:8000/oauth/redirect'
          : 'https://rule-34-api.herokuapp.com/oauth/redirect',
    }
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
