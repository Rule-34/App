<script lang="ts" setup>
  const featuredTags = [
    {
      name: 'Genshin Impact',
      path: '/posts?domain=rule34.xxx&tags=genshin_impact',
      imageUrl: '/img/featured/genshin_impact.jpg'
    },
    {
      name: 'Brawl Stars',
      path: '/posts?domain=rule34.xxx&tags=brawl_stars',
      imageUrl: '/img/featured/brawl_stars.jpg'
    },

    {
      name: 'Friday Night Funkin',
      path: '/posts?domain=rule34.xxx&tags=friday_night_funkin',
      imageUrl: '/img/featured/friday_night_funkin.jpg'
    },

    {
      name: 'Atomic Heart',
      path: '/posts?domain=rule34.xxx&tags=atomic_heart',
      imageUrl: '/img/featured/atomic_heart.jpg'
    },

    {
      name: 'Minecraft',
      path: '/posts?domain=rule34.xxx&tags=minecraft',
      imageUrl: '/img/featured/minecraft.jpg'
    },

    {
      name: 'Murder Drones',
      path: '/posts?domain=rule34.xxx&tags=murder_drones',
      imageUrl: '/img/featured/murder_drones.jpg'
    },

    {
      name: 'CountryHumans',
      path: '/posts?domain=rule34.xxx&tags=countryhumans',
      imageUrl: '/img/featured/countryhumans.jpg'
    },

    {
      name: 'Honkai: Star Rail',
      path: '/posts?domain=rule34.xxx&tags=honkai:_star_rail',
      imageUrl: '/img/featured/honkai_star_rail.jpg'
    },

    {
      name: "Five Nights at Freddy's",
      path: "/posts?domain=rule34.xxx&tags=five_nights_at_freddy's",
      imageUrl: '/img/featured/five_nights_at_freddys.jpg'
    },

    {
      name: 'Roblox',
      path: '/posts?domain=rule34.xxx&tags=roblox',
      imageUrl: '/img/featured/roblox.jpg'
    },

    {
      name: 'Undertale',
      path: '/posts?domain=rule34.xxx&tags=undertale',
      imageUrl: '/img/featured/undertale.jpg'
    }
  ]
</script>

<template>
  <ol
    class="scrollbar-hide flex gap-x-4 overflow-x-auto"
    v-bind="$attrs"
  >
    <li
      v-for="tag in featuredTags"
      :key="tag.name"
      class="max-w-[8rem] flex-shrink-0"
    >
      <NuxtLink
        :href="tag.path"
        class="focus-visible:focus-outline-util hover:hover-text-util hover:hover-bg-util block overflow-hidden rounded-md border border-transparent"
      >
        <figure>
          <img
            :alt="'Featured tag: ' + tag.name"
            :src="tag.imageUrl"
            class="h-auto w-full"
            height="800"
            loading="lazy"
            style="aspect-ratio: 800/1200"
            width="1200"
          />

          <figcaption class="truncate px-2 py-1.5 text-center text-sm font-medium">
            {{ tag.name }}
          </figcaption>
        </figure>
      </NuxtLink>
    </li>
  </ol>

  <span class="mt-3 block text-right text-xs">You can scroll through the list →</span>
</template>
