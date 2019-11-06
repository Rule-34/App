export default {
  mode: "spa",
  /*
   ** Headers of the page
   */
  head: {
    title: "Rule 34 PWA",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: "Rule 34 redesigned" }
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }]
  },
  /*
   ** Customize the progress-bar color
   */
  loading: {
    css: false,
    color: "white",
    failedColor: "red",
    height: "10px"
  },
  /*
   ** Customize the splash loading indicator
   */
  loadingIndicator: {
    name: "cube-grid",
    color: "white",
    background: "linear-gradient(152deg, #9b9be0 38%, #00d4ff 100%)"
  },
  /*
   ** Global CSS
   */
  css: [],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    {
      src: "~/plugins/v-debounce.js",
      mode: "client"
    },
    { src: "~/plugins/v-lazy.js", mode: "client" },
    { src: "~/plugins/insights.js", mode: "client" }
  ],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    // Doc: https://github.com/nuxt-community/nuxt-tailwindcss
    "@nuxtjs/tailwindcss"
  ],
  /*
   ** TailwindCSS settings
   */
  tailwindcss: {
    configPath: "~tailwind.config.js",
    cssPath: "~/assets/app.scss"
  },
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    "@nuxtjs/axios",
    "@nuxtjs/pwa",
    "nuxt-purgecss"
  ],
  /*
   ** Progressive web app
   */
  pwa: {
    manifest: {
      name: "Rule 34 PWA",
      lang: "en"
    },
    meta: {
      /* meta options */
      ogHost: "https://r34.app"
    }
  },
  /*
   ** PurgeCSS config
   */
  purgeCSS: {
    // whitelist: ['defaults-and-this-class']
    whitelistPatterns: [/active/]
  },
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {},
  /*
   ** Build configuration
   */
  build: {
    extractCSS: true,
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {}
  }
};
