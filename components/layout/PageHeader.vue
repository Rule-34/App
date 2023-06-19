<script lang="ts" setup>
  export interface PageHeaderProps {
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  }

  const props = withDefaults(defineProps<PageHeaderProps>(), {
    as: 'h1'
  })
</script>

<template>
  <div>
    <component
      :is="props.as"
      class="text-2xl font-bold leading-10 tracking-tight text-base-content-highlight"
    >
      <slot name="title" />
    </component>

    <p
      v-if="$slots.text"
      class="text-base-content"
    >
      <slot name="text" />
    </p>
  </div>
</template>
