export default {
  mode: 'spa',

  /*
   ** Headers of the page
   */
  head: {
    title: 'Rule 34 App',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: 'Browse the most popular boorus in the Rule 34 App',
      },
      {
        hid: 'monetization',
        name: 'monetization',
        content: '$ilp.uphold.com/Hb2w46bnxZfM',
      },
    ],
    link: [
      // Font
      { rel: 'stylesheet', href: 'https://rsms.me/inter/inter.css' },
    ],
  },

  /*
   ** Customize the progress-bar color
   */
  loading: {
    color: 'hsl(190, 100%, 50%)',
    // height: '5px',
    throttle: 300,
    // duration: 5000,
    continuous: true,
  },

  /*
   ** Customize the splash loading indicator
   */
  loadingIndicator: {
    name: 'cube-grid',
    color: '#121212',
    background: 'linear-gradient(152deg, #9b9be0 38%, #00d4ff 100%)',
  },

  /*
   ** Global CSS
   */
  css: ['~/assets/css/main.css'],

  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    { src: '~/plugins/vuex-persist.js', mode: 'client', ssr: false },
    { src: '~/plugins/vue-matomo.js', mode: 'client', ssr: false },
  ],

  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    // '@nuxtjs/eslint-module',
    // Doc: https://github.com/nuxt-community/nuxt-tailwindcss
    '@nuxtjs/tailwindcss',
  ],

  /*
   ** Nuxt.js modules
   */
  modules: ['@nuxtjs/pwa', '@nuxtjs/sitemap'],

  /*
   ** Progressive web app
   */
  pwa: {
    manifest: {
      name: 'Rule 34 App',
      short_name: 'Rule 34 App',
      lang: 'en',
      start_url: '/?origin=PWA',
      theme_color: '#121212',
      background_color: '#121212',
    },
    meta: {
      /* meta options */
      ogHost: 'https://r34.app',
      mobileAppIOS: true,
    },
    // Icon is automatically proccessed from static/icon.png
  },

  workbox: {
    runtimeCaching: [
      {
        // Should be a regex string. Compiles into new RegExp('https://my-cdn.com/.*')
        urlPattern: ['https://rsms.me/.*', 'https://r34.app/.*'],
        // Defaults to `networkFirst` if omitted
        // handler: 'networkFirst',
        // Defaults to `GET` if omitted
        // method: 'GET'
      },
    ],
  },

  /*
   ** TailwindCSS config
   */
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
  },

  /*
   ** Sitemap configuration
   */
  sitemap: {
    hostname: 'https://r34.app',
    gzip: true,
    defaults: {
      changefreq: 'daily',
      priority: 1,
      lastmod: new Date(),
      lastmodrealtime: true,
    },
    routes: ['/privacy-policy', '/terms-of-service'],
  },

  /*
   ** Build configuration
   */
  build: {
    // Necessary for CSS Purge
    extractCSS: true,

    //  Remove console.log everywhere
    terser: {
      terserOptions: {
        compress: {
          // drop_console: true,
          pure_funcs: ['console.log', 'console.debug'],
        },
      },
    },

    /*
     ** You can extend webpack config here
     */
    // extend(config, ctx) {
    //   if (ctx.isDev) {
    //     config.devtool = ctx.isClient ? 'source-map' : 'inline-source-map'
    //   }
    // },
  },
}
