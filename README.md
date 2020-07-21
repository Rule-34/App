# Rule 34 App

Browse the most popular boorus in the Rule 34 App

> Actually a Progressive Web App (PWA)

## Visit it

[https://r34.app/](https://r34.app/)

[![Netlify Status](https://api.netlify.com/api/v1/badges/703629e2-193f-4bb0-9349-f02a22d50ed1/deploy-status)](https://app.netlify.com/sites/rule34-app/deploys)

### Preview

![Dashboard Preview](.github/images/dashboard.png)
![Settings Preview](.github/images/settings.png)

### Supported sites

This app can browse the following sites

- rule34.xxx
- rule34.paheal.net
- danbooru.donmai.us
- gelbooru.com
- e621.net
- safebooru.org
- e926.net

## Social

### Discord

Join the community **[Discord](https://discord.gg/fUhYHSZ)** to keep up with the updates of this project!

![Discord](https://img.shields.io/discord/656241666553806861?style=for-the-badge)

### Twitter

Follow the Rule 34 App on **[Twitter](https://twitter.com/Rule34App)** for announcements and tips on how to use the App!

## Future

### API

This app uses a JSON wrapper for various Rule 34 APIs, it is developed and mantained by me, and can be found [here](https://github.com/AlejandroAkbal/Rule-34-API).

### Support

This project has various costs: domain, hosting, CloudFlare worker, maintenance, etc.

I am a student, so I'm not really in a position to maintain everything from my pocket

Since this is an **open source** project, with **no advertising** or any other way to generate revenue, I ask of you:

> **If you really like my work**, please donate whatever amount you can to ensure the future of this project.

[GitHub Sponsor](https://github.com/sponsors/AlejandroAkbal) | [LiberaPay](https://liberapay.com/AlejandroAkbal/) | [Patreon](https://patreon.com/AlejandroAkbal) | [PayPal](https://www.paypal.me/Alejandrorr7)

## Technicalities

### Languages

HTML, CSS, Javascript, NodeJS, NPM.

### Frameworks and tools

NuxtJS, VueJS, TailwindCSS, Webpack, etc.

## Development

When developing, posts wont load as the API has CORS enabled, for posts to work you'll need a browser extension to bypass CORS

- [Firefox](https://addons.mozilla.org/es/firefox/addon/cors-everywhere/)
- [Chrome](https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf)

### Requirements

- NodeJS >= 12
- NPM
- Microsoft Build Tools (Windows Only)

### Build setup

```bash
# Install dependencies
npm install

# Serve with hot reload at localhost:3000
npm run dev

# Generate static project
npm run generate
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).
