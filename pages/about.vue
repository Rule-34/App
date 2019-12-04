<template>
  <div>
    <div class="flex h-perfect p-3 overflow-hidden">
      <a
        :class="{ zoom: userSettings.zoom.value }"
        href="https://akbal.dev/"
        target="_blank"
        rel="noopener noreferrer"
        class="material-container m-auto p-5 shadow-xl"
      >
        <div>
          <picture>
            <source srcset="/img/ALogo.webp" type="image/webp" />
            <source srcset="/img/ALogo.png" type="image/png" />
            <img class="mx-auto mb-5" src="/img/ALogo.webp" alt="Akbal logo" />
          </picture>
          <h1
            class="py-1 px-3 border rounded-full w-fit-content mx-auto bg-gray-900 text-gray-300 shadow-md mb-1"
          >
            Alejandro Akbal
          </h1>
          <small class="text-black">
            I'm a web developer and this PWA is a project that I do in my free
            time
          </small>
        </div>
      </a>
    </div>

    <!-- Donation -->
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: mapState(['userSettings']),

  head() {
    return {
      title: 'About | Rule 34 App',
    }
  },
}
</script>
