<script lang="ts" setup>
  const { status, data, signIn, signOut } = useAuth()

  definePageMeta({
    auth: {
      unauthenticatedOnly: true,
      navigateAuthenticatedTo: '/premium'
    }
  })
</script>

<template>
  <main>
    <p>Sign-In:</p>
    <!-- NOTE: Here we hard-coded username and password, on your own page this should probably be connected to two inputs for username + password -->
    <button @click="signIn('credentials', { username: '_', password: 'TODO' })">Username and Password</button>
  </main>
</template>
