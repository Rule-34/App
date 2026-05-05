# AGENTS.md

## Stack

- **Nuxt 4** (SSR, Nitro server) with **Vue 3** + TypeScript
- **TailwindCSS v4** via `@tailwindcss/vite` Vite plugin (NOT PostCSS)
- **Vitest** + `@nuxt/test-utils` with Playwright browser mode for testing
- **Prettier** (formatting). ESLint config exists but is not wired to any npm script.

## Setup

```bash
cp .example.env .env   # then edit .env
npm install             # triggers nuxt prepare via postinstall
```

- **Node ≥ 24** required (`package.json` engines)
- **Git submodule** at `assets/lib/rule-34-shared-resources` — clone with `--recursive`
- **External API**: the app calls a separate API service at `NUXT_PUBLIC_API_URL` (default `http://localhost:8081`). The
  API codebase is at [github.com/Rule-34/API](https://github.com/Rule-34/API).

## Commands

| Command              | What it does                                  |
|----------------------|-----------------------------------------------|
| `npm run dev`        | Dev server at `localhost:8080`                |
| `npm run build`      | Production build into `.output/`              |
| `npm run generate`   | Static generation                             |
| `npm test`           | `vitest run`                                  |
| `npm run test:watch` | `vitest watch`                                |
| `npm run release`    | `standard-version` for versioning + changelog |

## Architecture

Single Nuxt app. Key directories:

| Dir                  | Purpose                                                                                   |
|----------------------|-------------------------------------------------------------------------------------------|
| `config/`            | Centralized project config (`project.ts` for branding/URLs, `i18n.ts` for locales)        |
| `app/`               | Nuxt app-level config (router options, SPA loading template)                              |
| `composables/`       | Shared Vue composables (auto-imported by Nuxt)                                            |
| `plugins/`           | Client plugins loaded in order by numeric prefix (`020.`, `030.`, `035.`, `040.`, `050.`) |
| `server/api/`        | Nitro server API routes                                                                   |
| `server/middleware/` | Nitro middleware                                                                          |
| `server/plugins/`    | Nitro plugins                                                                             |
| `assets/js/`         | Shared JS utilities, DTOs, custom providers                                               |
| `assets/lib/`        | Git submodule for shared resources                                                        |
| `locales/`           | i18n JSON files (en, ru, es, ja)                                                          |
| `components/`        | Vue components — **auto-imported flat** (`pathPrefix: false`, no folder prefix)           |
| `test/`              | Page tests, server tests, mocks                                                           |

## Conventions & Gotchas

### Component auto-imports

Components are registered **without path prefix** (`nuxt.config.js` → `components: [{ pathPrefix: false }]`). Import
them as `<DomainSelector>` not `<Input/DomainSelector>`.

### i18n

- Locales are defined in `config/i18n.ts` (single source of truth).
- Non-default locales (ru, es, ja) get URL prefixes. Route rules in `nuxt.config` are mirrored via the
  `mirroredRouteRules()` helper so prefixed paths get the same caching/SSR rules.
- **Known bug**: `canonicalQueries` in the i18n module config is a no-op in v10. A two-part workaround is required:
  1. SSR: `server/plugins/fix-canonical-queries.ts` patches the canonical `<link>` in rendered HTML.
  2. CSR: `pages/posts/[domain].vue` uses `useHead` to re-apply the canonical after i18n overwrites it on hydration.
  See the removal checklist in `fix-canonical-queries.ts` for when upstream fixes this.

### SEO & Head Management

- **Static global tags** (favicon, rating, monetization, color-scheme) can live in `nuxt.config.js` `head.meta`.
- **Dynamic global tags** that need the request host (description, keywords, OG image) belong in `app.vue` using
  `useSeoMeta` inside an `if (import.meta.server)` guard — `nuxt.config.js` runs too early to know the host.
- **OG image must be absolute**: Open Graph requires absolute URLs. Build it dynamically with
  `useRequestURL().origin` on the server only (`app.vue`). i18n does not touch `og:image` during hydration.
- **Canonical URLs must point to production** (`https://r34.app/…`) even when served from clone domains. This is
  intentional for SEO — canonicals prevent duplicate content. Use `project.urls.production` for canonicals.
- **Page-specific tags** (title, description) should use `useSeoMeta` in the page component.

### Router

- Custom scroll behavior: skips scroll-to-top when only the `page` query param changes between same-route navigations.
- Legacy redirect: `server/middleware/redirect-to-posts.get.ts` redirects `/?domain=x&page=…&tags=…` →
  `/posts/x?page=…&tags=…` (301).

### Images

A custom `imgproxy` provider is registered for `<NuxtImg>` (see `nuxt.config.js` → `image.providers`). Images are
deliberately generated at 1x density only (webp format) to reduce bandwidth.

### PWA

The service worker is intentionally disabled (`selfDestroying: true`). Do not add service worker logic.

### TailwindCSS

Tailwind v4 uses CSS-based config (`assets/css/main.css`), NOT PostCSS. The `tailwind.config.js` remains only for the
`@headlessui/tailwindcss` plugin.

### Sentry

- Client: configured in `sentry.client.options.ts` (replay, third-party error filter, deny URLs).
- Server: `sentry.server.config.ts` reads DSN from env vars directly (before Nuxt boots).
- Source map uploads only happen in production Docker builds (needs `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`
  build args).

### Testing

- Tests use `@nuxt/test-utils` with Playwright inside `describe` blocks that call `await setup({ browser: true })`.
- Server-side API calls are mocked via a test-only Nitro plugin at `test/server-mocks/plugin.ts`, injected through
  `nuxt.config.js` → `$test.nitro.plugins`.
- In test mode, `$test.runtimeConfig.public.apiUrl` is set to `''` so `$fetch(baseURL: '')` routes to the local Nitro
  test server.
- Sentry is fully disabled in tests via `$test.sentry.enabled: false` in `nuxt.config.js`.
- Debug mode: import `debugBrowserOptions` from `test/helper.ts` for headful playback with slowMo.

### Docker production build

- Multi-stage: build stage needs `SENTRY_*` args for source map uploads; production stage copies only `.output/` (no
  `node_modules` needed — Nitro bundles everything).
- `NITRO_PRESET` build arg selects the deployment target.

### Prettier

Key settings: 120-char print width, no semicolons, single quotes, trailing commas removed, single attribute per line in
Vue templates.

