<template>
  <DynamicScroller
    :items="posts"
    :min-item-size="1000"
    :page-mode="true"
    :buffer="dynamicBufferHeight"
  >
    <template v-slot="{ item, index, active }">
      <!--  -->
      <DynamicScrollerItem :item="item" :active="active" :data-index="index">
        <!--  -->
        <Post
          :key="`${postsDomain}-${item.id}`"
          :postData="item"
          :postDomain="postsDomain"
          :viewOnly="viewOnly"
        />
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>
</template>

<script>
export default {
  props: {
    posts: {
      type: Array,
      required: true,
    },

    postsDomain: {
      type: String,
      required: true,
    },

    viewOnly: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    dynamicBufferHeight() {
      return window.screen.availHeight * 1.5
    },
  },
}
</script>

<style lang="postcss">
/* Apply spacing to elements inside DynamicScrollerItem */

.vue-recycle-scroller__item-wrapper
  > :not([hidden])
  ~ :not([hidden])
  > :not([hidden]) {
  --tw-space-y-reverse: 0;
  margin-top: calc(1rem * calc(1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(1rem * var(--tw-space-y-reverse));
}
</style>
