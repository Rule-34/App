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
- gelbooru.com
- e621.net
- safebooru.org
- e926.net

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

NuxtJS, VueJS, TailwindCSS, etc.

Check the [package.json](./package.json) for more information.

## API

This App uses an [API](https://github.com/Rule-34/API) to communicate with all the Boorus.

## Development

### Requirements

- NodeJS >= 20
- NPM

### Setup

#### Git Submodules

Use `git clone --recursively` because [this repository](https://github.com/Rule-34/Shared-Resources) is used to share
some necessary resources.

#### Environment variables

```bash
# Modify .env file
cp .env.example .env
```

#### NodeJS

```bash
# Install dependencies
npm install

# Serve with hot reload at localhost:8080
npm run dev

# Generate static project
npm run generate
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).
