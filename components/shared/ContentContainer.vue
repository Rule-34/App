<script lang="ts" setup>
  import { isExternalHref } from '~/composables/locale'

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
      class="text-base-content-highlight text-lg leading-8 font-bold tracking-wide"
    >
      {{ title }}
    </component>

    <!-- Text -->
    <!-- Using v-text as using {{}} would add a `new line` character that `whitespace-pre-line` would interpret. -->
    <p
      v-if="props.text"
      class="text-base-content text-sm whitespace-pre-line"
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
          :rel="
            isExternalHref(link.href)
              ? 'nofollow noopener noreferrer'
              : link.target === '_blank'
                ? 'noopener noreferrer'
                : undefined
          "
          :target="link.target"
          class="hover:hover-text-util focus-visible:focus-outline-util text-base-content text-sm underline"
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
