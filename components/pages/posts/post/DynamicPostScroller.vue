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
          :key="`${getPostDomain(item)}-${item.id}`"
          :postData="item"
          :postDomain="getPostDomain(item)"
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
      default: undefined,
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

  methods: {
    getPostDomain(post) {
      // If domain is not assigned directly, load it from the `_saved_post_metadata` attribute on the `posts` prop
      if (this.postsDomain === '<All Boorus>') {
        return post['_saved_post_meta_data'].booru_domain
      }

      return this.postsDomain
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
