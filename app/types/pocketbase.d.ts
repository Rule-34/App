import type PocketBase from 'pocketbase'

declare module '#app' {
  interface NuxtApp {
    $pocketBase: PocketBase
  }
}

declare module '#app/nuxt' {
  interface NuxtApp {
    $pocketBase: PocketBase
  }
}

declare module 'nuxt/app' {
  interface NuxtApp {
    $pocketBase: PocketBase
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $pocketBase: PocketBase
  }
}

export {}
