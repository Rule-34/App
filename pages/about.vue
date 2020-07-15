<template>
  <main class="flex h-screen p-3">
    <a
      href="https://akbal.dev/"
      target="_blank"
      rel="noopener"
      class="p-5 m-auto shadow-md material-container bg-elevation"
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
          class="px-3 py-1 mx-auto mb-1 rounded-full shadow-md material-container w-max-content bg-background"
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
export default {
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
