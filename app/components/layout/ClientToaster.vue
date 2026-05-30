<script lang="ts" setup>
  import { Toaster } from 'vue-sonner'
  import 'vue-sonner/style.css'

  const { markToasterReady, markToasterUnmounted } = useLazyToast()

  onMounted(markToasterReady)
  onBeforeUnmount(markToasterUnmounted)
</script>

<template>
  <Toaster
    :expand="true"
    close-button
    position="top-center"
    theme="dark"
  />
</template>
