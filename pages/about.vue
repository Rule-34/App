<template>
  <div class="flex flex-col justify-around h-screen">
    <main class="flex flex-auto">
      <div class="p-5 m-auto shadow-md material-container bg-elevation">
        <picture>
          <source srcset="~/assets/img/brand/akbal.webp" type="image/webp" />

          <img
            src="~/assets/img/brand/akbal.png"
            alt="Akbal logo"
            loading="eager"
            height="206"
            width="231"
            class="block mx-auto"
          />
        </picture>

        <a
          href="https://akbal.dev/"
          target="_blank"
          rel="noopener"
          class="block px-3 py-1 mx-auto mt-5 mb-2 rounded-full shadow-md material-container w-max-content bg-background"
        >
          Alejandro Akbal
        </a>

        <small class="block text-default-text">
          I'm a software developer and this App is a project that I do in my
          free time.
        </small>
      </div>
    </main>

  </div>
</template>

<script>
export default {
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
