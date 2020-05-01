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
          <source srcset="~/assets/img/brand/akbal.webp" type="image/webp" />
          <img
            class="mx-auto mb-5"
            src="~/assets/img/brand/akbal.png"
            alt="Akbal logo"
            loading="eager"
            height="206"
            width="231"
          />
        </picture>
        <h1
          class="material-container rounded-full w-max-content bg-background mx-auto shadow-md mb-1 py-1 px-3"
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
          content: 'Information about the Rule 34 App and Its creator.',
        },
      ],
    }
  },
}
</script>
