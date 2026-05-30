# AGENTS.md

## Stack

- **Nuxt 4** (SSR, Nitro server) with **Vue 3** + TypeScript
- **TailwindCSS v4** via `@tailwindcss/vite` Vite plugin (NOT PostCSS)
- **Vitest** + `@nuxt/test-utils` with Playwright browser mode for testing
- **Prettier** (formatting) + Nuxt flat ESLint via `@nuxt/eslint`

## Setup

```bash
cp .example.env .env   # then edit .env
pnpm install            # triggers nuxt prepare via postinstall
```

- **Node 24** required (`package.json` engines)
- **pnpm ≥ 11.2.2** required (`packageManager` pins the expected version)
- **Git submodule** at `app/assets/lib/rule-34-shared-resources` — clone with `--recursive`
- **External API**: the app calls a separate API service at `NUXT_PUBLIC_API_URL` (default `http://localhost:8081`). The
  API codebase is at [github.com/Rule-34/API](https://github.com/Rule-34/API).

## Commands

| Command           | What it does                                                                   |
| ----------------- | ------------------------------------------------------------------------------ |
| `pnpm dev`        | Dev server at `localhost:8080` via `HOST=127.0.0.1`                            |
| `pnpm build`      | Production build into `.output/`                                               |
| `pnpm generate`   | Static generation                                                              |
| `pnpm format`     | Prettier write                                                                 |
| `pnpm lint`       | ESLint flat config                                                             |
| `pnpm typecheck`  | `nuxt typecheck`                                                               |
| `pnpm test`       | `vitest run`                                                                   |
| `pnpm test:watch` | `vitest watch`                                                                 |
| `pnpm check`      | Strict local gate: format check, lint, typecheck, test typecheck, tests, build |
| `pnpm release`    | `commit-and-tag-version` for versioning + changelog                            |

## Architecture

Single Nuxt app. Key directories:

| Dir                  | Purpose                                                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `app/`               | Nuxt 4 app source (`app.vue`, router options, assets, components, composables, layouts, middleware, pages, plugins, app-local types) |
| `config/`            | Centralized root config (`project.ts` for branding/URLs, `i18n.ts` for locales)                                                      |
| `server/api/`        | Nitro server API routes                                                                                                              |
| `server/middleware/` | Nitro middleware                                                                                                                     |
| `server/plugins/`    | Nitro plugins                                                                                                                        |
| `app/assets/js/`     | Shared app JS utilities, DTOs, custom providers                                                                                      |
| `app/assets/lib/`    | Git submodule for shared resources                                                                                                   |
| `i18n/locales/`      | i18n JSON files (en, ru, es, ja, pt, de, fr)                                                                                         |
| `app/components/`    | Vue components — **auto-imported flat** (`pathPrefix: false`, no folder prefix)                                                      |
| `test/`              | Page tests, server tests, mocks                                                                                                      |

## Conventions & Gotchas

### Component auto-imports

Components are registered **without path prefix** (`nuxt.config.ts` → `components: [{ pathPrefix: false }]`). Import
them as `<DomainSelector>` not `<Input/DomainSelector>`.

### Local dev host

- Keep `HOST=127.0.0.1` in local `.env`/`.example.env` for `pnpm dev`. On macOS, `localhost` can resolve to `::1`
  first; Nuxt/Vite can then answer normal browser requests with a plain `426 Upgrade Required` from the IPv6 listener.
- If Chrome shows only `Upgrade Required`, verify with `curl -I http://localhost:8080/...`,
  `curl -I http://127.0.0.1:8080/...`, and `lsof -nP -iTCP:8080 -sTCP:LISTEN`, then restart the dev server with the
  IPv4 host binding.

### i18n

- Locales are defined in `config/i18n.ts` (single source of truth).
- Non-default locales (ru, es, ja) get URL prefixes. Route rules in `nuxt.config` are mirrored via the
  `mirroredRouteRules()` helper so prefixed paths get the same caching/SSR rules.
- **Known bug**: `canonicalQueries` in the i18n module config is a no-op in v10. A two-part workaround is required:
  1. SSR: `server/plugins/fix-canonical-queries.ts` patches the canonical `<link>` in rendered HTML.
  2. CSR: `app/pages/posts/[domain]/index.vue` uses `useHead` to re-apply the canonical after i18n overwrites it on hydration.
     See the removal checklist in `fix-canonical-queries.ts` for when upstream fixes this.

### SEO & Head Management

- **Static global tags** (favicon, rating, monetization, color-scheme) can live in `nuxt.config.ts` `head.meta`.
- **Dynamic global tags** that need the request host (description, keywords, OG image) belong in `app/app.vue` using
  `useSeoMeta` inside an `if (import.meta.server)` guard — `nuxt.config.ts` runs too early to know the host.
- **OG image must be absolute**: Open Graph requires absolute URLs. Build it dynamically with
  `useRequestURL().origin` on the server only (`app/app.vue`). i18n does not touch `og:image` during hydration.
- **Canonical URLs must point to production** (`https://r34.app/…`) even when served from clone domains. This is
  intentional for SEO — canonicals prevent duplicate content. Use `project.urls.production` for canonicals.
- **Schema.org breadcrumb item URLs should stay local/locale-relative**. Do not convert breadcrumb items to
  `project.urls.production`; production-absolute URLs are for canonicals.
- **Page-specific tags** (title, description) should use `useSeoMeta` in the page component.

### Router

- Custom scroll behavior: skips scroll-to-top when only the `page` query param changes between same-route navigations.
- Query filters intentionally use flat bracket keys (`filter[sort]`, `filter[rating]`, etc.) with Vue Router's default
  query handling. Do not re-add `qs` for nested `route.query.filter` objects unless the URL contract changes; `qs` puts
  a measurable parser/stringifier cost on the first-load router path.
- Legacy redirect: `server/middleware/redirect-to-posts.get.ts` redirects `/?domain=x&page=…&tags=…` →
  `/posts/x?page=…&tags=…` (301).

### Images

A custom `imgproxy` provider is registered for `<NuxtImg>` (see `nuxt.config.ts` → `image.providers`). Images are
deliberately generated at 1x density only (webp format) to reduce bandwidth.

- `@nuxt/image` v2 supports `preload: { fetchPriority: 'high' }`. Use the module API for image preload priority instead
  of patching rendered HTML in Nitro.
- `PostMedia` uses imgproxy for SSR post images, including local development. Non-premium SPA navigations keep the direct
  image path; validate image delivery in an environment where imgproxy can resolve the source URL.

### Headless UI

- Do not add `provideHeadlessUseId` in `app/app.vue` while the project uses Vue 3.5+ and `@headlessui/vue` 1.7.23+; those
  versions use Vue's native `useId` and the Nuxt Headless UI workaround is only for older versions.

### Toasts

- `useLazyToast()` lazy-loads `vue-sonner` and renders `ClientToaster` on first use. The first toast must wait for
  `ClientToaster` to mount before calling `toast.*`; a plain `nextTick()` can fire before `<LazyClientToaster>` has
  finished loading and silently drop the toast.

### Performance

- Prefer high-impact, measurable optimizations over small rewrites. Keep battle-tested dependencies unless replacing one
  has a clear, measured payoff.
- After substantial performance changes, verify with a production build, relevant tests, request traces, and Lighthouse
  against the built app before deciding the change is worth keeping.
- Production is behind Cloudflare, which Brotli-compresses HTML responses. Do not add app-level HTML compression unless
  a direct-origin deployment needs it and the change is verified with headers, byte sizes, warm TTFB, and Lighthouse.
- Keep the global TanStack Vue Query plugin unless a larger measured payoff appears. A route-scoped `QueryClient`
  experiment on 2026-05-17 saved only about 8 KB compressed on the homepage and did not move Lighthouse, while adding
  custom SSR hydration logic.
- Keep `features.inlineStyles: false` unless new measurements justify revisiting it. Enabling it on 2026-05-17 doubled
  homepage HTML from about 51 KB to 106 KB, increased Lighthouse byte weight from 361 KiB to 406 KiB, and did not improve
  the performance score.
- Keep `@formkit/auto-animate` route-scoped unless it is used broadly. The Nuxt module registers a global directive and
  puts the runtime in the first-load entry; local `vAutoAnimate` imports on the premium CSR pages saved about 3 KB gzip.
- For URL validation/parsing, prefer `URL.canParse()` or `URL.parse()` over constructor `try/catch`; use `URL.parse()`
  when the parsed URL object is needed, with a `URL.canParse()` fallback in browser code if compatibility matters.

### PWA

The service worker is intentionally disabled (`selfDestroying: true`). Do not add service worker logic.

### TailwindCSS

Tailwind v4 uses CSS-based config (`app/assets/css/main.css`), NOT PostCSS. The `tailwind.config.js` remains only for
the `@headlessui/tailwindcss` plugin.

### Sentry

- Client: configured in `sentry.client.options.ts` (replay, third-party error filter, deny URLs).
- Server: `sentry.server.config.ts` reads DSN from env vars directly (before Nuxt boots).
- Source map uploads only happen in production Docker builds (needs `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`
  build args).

### Testing

- Tests use `@nuxt/test-utils` with Playwright inside `describe` blocks that call `await setup({ browser: true })`.
- Server-side API calls are mocked via a test-only Nitro plugin at `test/server-mocks/plugin.ts`, injected through
  `nuxt.config.ts` → `$test.nitro.plugins`.
- In test mode, `$test.runtimeConfig.public.apiUrl` is set to `''` so `$fetch(baseURL: '')` routes to the local Nitro
  test server.
- Sentry is fully disabled in tests via `$test.sentry.enabled: false` in `nuxt.config.ts`.
- Debug mode: import `debugBrowserOptions` from `test/helper.ts` for headful playback with slowMo.
- For premium and PocketBase flows, use a real authenticated browser session for final investigation when possible.
  Unit tests can prove payload and repository behavior, but real-browser traces catch request bursts, realtime echo
  refreshes, auth redirects, and UI state changes that are easy to miss in isolated tests.

### Premium Cloud Sync

- Empty cloud state means "no user-authored cloud override"; do not seed PocketBase from local defaults during initial
  load. Only write premium cloud records after explicit user edits.
- PocketBase realtime subscriptions echo local writes. When debugging sync performance, inspect real network traces and
  separate write requests from realtime-triggered refreshes.
- Saved posts use the same premium cloud realtime runtime as tag collections, custom boorus, and the custom blocklist.
  Empty saved-post cloud state means there are no saved posts, unlike empty user-authored sync collections where local
  defaults can still apply.
- In `/premium/saved-posts`, unsaving a post intentionally should not remove the row or prune cached infinite-query data.
  Keep the viewer stable so users do not lose scroll/progress; the save button can update immediately and the row can
  disappear on a later reload/refetch.
- Use PocketBase batch writes for multi-record replacement/reorder operations. Reordering positioned records should not
  emit one HTTP write per changed row when the SDK batch API is available.
- VueUse `moveArrayElement()` applies the array move on `nextTick`. For state that is immediately persisted, build the
  reordered array synchronously instead of reading it before VueUse has applied the move.

### Docker production build

- Multi-stage: build stage uses `pnpm install --frozen-lockfile`. Source map uploads need `SENTRY_ORG`,
  `SENTRY_PROJECT`, and `SENTRY_AUTH_TOKEN`; set `SENTRY_UPLOAD_SOURCE_MAPS=false` to skip them. The production stage
  copies only `.output/` (no `node_modules` needed — Nitro bundles everything).
- `NITRO_PRESET` build arg selects the deployment target.

### Prettier

Key settings: 120-char print width, no semicolons, single quotes, trailing commas removed, single attribute per line in
Vue templates.
