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
        <Post :key="item.id" :post-domain="postsDomain" :post-data="item" />
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
