# Rule 34 App

A Progressive Web App to browse popular Rule 34 Hentai Porn for free.

## Usage

Use the following link to use it on any device that has a _modern_ internet browser.
_This includes Android, iOS, Windows, MacOS, and most consoles like the Play Station and Xbox._

**[✨ https://r34.app ✨](https://r34.app/?utm_source=github&utm_medium=readme)**

## Screenshots

![Posts](https://i.imgur.com/uOiZbXw_d.png?maxwidth=400&fidelity=high) ![Search](https://i.imgur.com/DmsT5TA_d.png?maxwidth=400&fidelity=high)

## Information

### Supported Boorus

This app can browse the following Boorus.

- rule34.xxx
- rule34.paheal.net
- e621.net
- e6ai.net
- e926.net
- safebooru.org
- gelbooru.com
- danbooru.donmai.us
- realbooru.com
- tbib.org
- xbooru.com
- yande.re
- konachan.com
- hypnohub.net
- aibooru.online
- booru.allthefallen.moe
- sakugabooru.com

### Documentation

Links to useful information.

- [Frequently Asked Questions](https://rule34.app/frequently-asked-questions)
- [How to install the App](https://www.installpwa.com/from/r34.app)

## Social

### Twitter

Follow the Rule 34 App on **[Twitter](https://twitter.com/Rule34App)** for announcements, tips, discount codes and more.

![Twitter badge](https://img.shields.io/twitter/follow/Rule34App?style=for-the-badge)

### Discord

Join the **[Discord](https://discord.gg/fUhYHSZ)** community to keep up with the updates of the project and
receive support.

![Discord badge](https://img.shields.io/discord/656241666553806861?style=for-the-badge)

## Technicalities

### Languages

HTML, CSS, JavaScript, NodeJS.

### Frameworks and tools

Nuxt, Vue, TypeScript, TailwindCSS, and more.

Check the [package.json](./package.json) for more information.

## API

This App uses an [API](https://github.com/Rule-34/API) to communicate with all the Boorus.

## Development

### Requirements

- Node.js 24
- pnpm 11.2.2 or newer

### Setup

#### Git Submodules

Use `git clone --recursively` because [this repository](https://github.com/Rule-34/Shared-Resources) is used to share
some necessary resources.

The shared resources submodule lives at `app/assets/lib/rule-34-shared-resources`.

#### Environment variables

```bash
# Modify .env file
cp .example.env .env
```

The default `.example.env` binds the Nuxt dev server to `127.0.0.1`. Keep that value unless you need to test from
another device; it avoids macOS/Chrome resolving `localhost` to Nuxt's IPv6 listener and showing a plain
`Upgrade Required` response.

#### NodeJS

```bash
# Install dependencies
pnpm install

# Serve with hot reload at localhost:8080
pnpm dev

# Build for production
pnpm build

# Generate static project
pnpm generate

# Run the strict local gate
pnpm check
```

## Project layout

This is a Nuxt 4 app using the default `app/` source layout. Pages, components, composables, plugins, middleware,
layouts, app assets, and app-local types live under `app/`. Root-level `config/`, `i18n/`, `server/`, `public/`, and
`test/` stay at the repository root.

For detailed explanation on how things work, check out [Nuxt docs](https://nuxt.com).
