<script setup>
  const config = useRuntimeConfig()

  useHead({
    htmlAttrs: {
      lang: 'en'
    },

    titleTemplate: (titleChunk) => {
      return titleChunk ? `${titleChunk} | Rule 34 App` : 'Rule 34 App'
    },

    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },

      // TODO: Improve description
      {
        name: 'description',
        content: 'Stream and download images, GIFs and videos hentai. For free!'
      },

      {
        name: 'rating',
        content: 'adult'
      },

      {
        name: 'color-scheme',
        content: 'dark'
      },

      {
        name: 'theme-color',
        content: '#000'
      },

      {
        name: 'monetization',
        content: config.public.MONETIZATION_URI
      }
    ],

    link: [
      // Favicon
      {
        rel: 'icon',
        href: '/favicon.ico',
        sizes: 'any'
      },
      {
        rel: 'icon',
        href: '/icon.svg',
        type: 'image/svg+xml'
      },
      {
        rel: 'apple-touch-icon',
        href: '/apple-touch-icon-180x180.png'
      },

      // Font
      {
        rel: 'preconnect',
        href: 'https://rsms.me'
      },

      {
        rel: 'stylesheet',
        type: 'text/css',
        href: 'https://rsms.me/inter/inter.css'
      }
    ],

    script: [
      {
        type: 'text/partytown',
        children: `
          var _paq = window._paq = window._paq || [];

          _paq.push(["disableCookies"]);
          _paq.push(['trackPageView']);
          _paq.push(['enableLinkTracking']);

          (function() {
            var u="https://matomo.akbal.dev/";
            _paq.push(['setTrackerUrl', u+'matomo.php']);
            _paq.push(['setSiteId', '1']);
            var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
            g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
          })();
        `
      }
    ]
  })

  useSchemaOrg([
    defineWebSite({
      name: 'Rule 34 App'
    }),
    defineWebPage(),
    defineOrganization({
      name: 'Rule 34 App',
      logo: '/icon.svg',
      sameAs: [
        'https://rule34.app',
        'https://twitter.com/Rule34App',
        'https://redirect.r34.app/twitter',
        'https://redirect.r34.app/discord',
        'https://redirect.r34.app/github'
      ]
    })
  ])
</script>

<template>
  <VitePwaManifest />

  <NuxtLoadingIndicator
    :height="5"
    :throttle="250"
  />

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
