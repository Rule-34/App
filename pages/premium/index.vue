<script lang="ts" setup>
  definePageMeta({
    middleware: 'auth',

    auth: {
      unauthenticatedOnly: true,
      navigateAuthenticatedTo: '/premium/profile'
    }
  })
</script>

<template>
  <main>
    <!-- Subscription -->

    <!-- Sign in-->
  </main>
</template>
