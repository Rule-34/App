<template>
  <article class="material-container">
    <div class="bg-gradient-to-r from-primary-400 to-accent-400 p-3">
      <div class="text-center text-black">
        <!-- Head -->
        <h1 class="text-lg font-semibold tracking-wide">{{ title }}</h1>

        <!-- Body -->
        <p v-if="text">{{ text }}</p>
      </div>
    </div>
  </article>
</template>

<script>
export default {
  props: {
    title: { type: String, required: true },
    text: { type: String, required: false, default: undefined }
  }
}
</script>
