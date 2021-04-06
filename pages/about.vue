<template>
  <div
    class="relative flex flex-col items-center justify-center max-w-3xl min-h-screen px-4 mx-auto sm:px-6 lg:px-8"
  >
    <main class="p-5 shadow-md material-container">
      <picture>
        <source srcset="~/assets/img/brand/akbal.webp" type="image/webp" />

        <img
          src="~/assets/img/brand/akbal.png"
          alt="Akbal logo"
          loading="eager"
          height="206"
          width="231"
          class="mx-auto"
        />
      </picture>

      <a
        href="https://akbal.dev/"
        target="_blank"
        rel="noopener"
        class="block px-3 py-1 mx-auto mt-5 mb-2 rounded-full shadow-md color-util border-util w-max bg-background"
      >
        Alejandro Akbal
      </a>

      <small class="block text-center text-default-text">
        I'm a software developer and this App is a project that I do in my free
        time.
      </small>
    </main>

    <footer
      class="absolute inset-x-0 bottom-0 p-2 text-xs text-center text-default-text-muted"
    >
      v{{ app_version }}
    </footer>
  </div>
</template>

<script>
import { version } from '~/package.json'

export default {
  data() {
    return { app_version: version }
  },

  head() {
    return {
      title: 'About',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: 'Information about the App',
        },
      ],
    }
  },
}
</script>
