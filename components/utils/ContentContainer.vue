<script setup>
  const props = defineProps({
    title: {
      type: String,
      required: true
    },

    text: {
      type: String,
      required: false,
      default: undefined
    },

    links: {
      type: Array,
      required: false,
      default: () => []
    }
  })
</script>

<template>
  <div class="card-body">
    <!-- Title -->
    <h2 class="text-lg font-bold leading-8 tracking-wide text-base-content-highlight">{{ title }}</h2>

    <!-- Text -->
    <!-- Using v-text as using {{}} would add a `new line` character that `whitespace-pre-line` would interpret. -->
    <p
      v-if="text"
      class="whitespace-pre-line text-sm text-base-content"
      v-text="text"
    />

    <!-- Links -->
    <ol v-if="links.length">
      <li
        v-for="(link, index) in links"
        :key="link.text"
      >
        <NuxtLink
          :href="link.href"
          class="hover:hover-text-util focus-visible:focus-util text-sm text-base-content underline"
        >
          {{ link.text }}
        </NuxtLink>

        <!-- Separator -->
        <template v-if="index !== links.length - 1"> -</template>
      </li>
    </ol>

    <!-- Extra information -->
    <slot />
  </div>
</template>
