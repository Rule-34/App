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
      class="text-2xl leading-10 font-bold tracking-tight text-base-content-highlight"
    >
      <slot name="title" />
    </component>

    <!-- A div, not a p: the slot can hold block content like an h1, and the HTML parser closes a p before it -->
    <div
      v-if="$slots.text"
      class="text-base-content"
    >
      <slot name="text" />
    </div>
  </div>
</template>
