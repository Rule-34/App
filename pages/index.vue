<script lang="ts" setup>
  definePageMeta({
    middleware: [
      // Redirect to /posts with the same params
      function (to, from) {
        return navigateTo({ path: '/posts', query: to.query, hash: to.hash })
      }
    ]
  })
</script>

<template>
  <main>
    Hello World
    <!--  TODO: Intro -->
    <!--  TODO: Go to pages -->
    <!--  TODO: Search -->
  </main>
</template>
