<script lang="ts" setup>
  import { Toaster } from 'vue-sonner'
  import 'vue-sonner/style.css'
</script>

<template>
  <Toaster
    :expand="true"
    close-button
    position="top-center"
    theme="dark"
  />
</template>
