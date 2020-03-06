<template>
  <main class="flex h-screen p-3">
    <a
      :class="{ zoom: userSettings.zoom.value }"
      href="https://akbal.dev/"
      target="_blank"
      rel="noopener noreferrer"
      class="material-container bg-elevation m-auto p-5 shadow-md"
    >
      <div>
        <picture>
          <source srcset="/img/ALogo.webp" type="image/webp" />
          <source srcset="/img/ALogo.png" type="image/png" />
          <img
            class="mx-auto mb-5"
            src="/img/ALogo.webp"
            alt="Akbal logo"
            loading="eager"
          />
        </picture>
        <h1
          class="material-container rounded-full bg-background w-fit-content mx-auto shadow-md mb-1 py-1 px-3"
        >
          Alejandro Akbal
        </h1>
        <small class="text-default-text">
          I'm a web developer and this App is a project that I do in my free
          time
        </small>
      </div>
    </a>
  </main>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: mapState(['userSettings']),

  head() {
    return {
      title: 'About',
      meta: [
        {
          hid: 'about',
          name: 'description',
          content: 'About the Rule 34 App and Its creator'
        }
      ]
    }
  }
}
</script>
