<script lang="ts" setup>
  export interface PageTextProps {
    as?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'

    title: string
    text?: string
    links?: {
      text: string
      href: string
      target?: string
    }[]
  }

  const props = withDefaults(defineProps<PageTextProps>(), {
    as: 'h2'
  })
</script>

<template>
  <div class="card-body">
    <!-- Title -->
    <component
      :is="props.as"
      class="text-lg font-bold leading-8 tracking-wide text-base-content-highlight"
    >
      {{ title }}
    </component>

    <!-- Text -->
    <!-- Using v-text as using {{}} would add a `new line` character that `whitespace-pre-line` would interpret. -->
    <p
      v-if="props.text"
      class="whitespace-pre-line text-sm text-base-content"
      v-text="props.text"
    />

    <!-- Links -->
    <ol v-if="props.links">
      <li
        v-for="(link, index) in props.links"
        :key="link.href"
        class="inline"
      >
        <NuxtLink
          :href="link.href"
          :target="link.target"
          rel='nofollow noopener noreferrer'
          class="hover:hover-text-util focus-visible:focus-outline-util text-sm text-base-content underline"
        >
          {{ link.text }}
        </NuxtLink>

        <!-- Separator -->
        <template v-if="index !== props.links.length - 1">
          <span class="mx-1.5">&middot;</span>
        </template>
      </li>
    </ol>

    <!-- Extra information -->
    <slot />
  </div>
</template>
