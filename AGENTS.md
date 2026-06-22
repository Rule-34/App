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
| `i18n/locales/`      | i18n JSON files (en, ru, es, ja, pt, de, fr, zh, ko, id, tr, it, vi)                                                                 |
| `app/components/`    | Vue components — **auto-imported flat** (`pathPrefix: false`, no folder prefix)                                                      |
| `test/`              | Page tests, server tests, mocks                                                                                                      |

## Conventions & Gotchas

### Dependencies

- Do not carry local dependency patches (`pnpm patch`, `patch-package`, `patchedDependencies`) in this repo. For
  third-party bugs, prefer an upstream release, a supported configuration/workaround, or ignoring the specific Sentry
  issue when it is non-user-facing noise.
- With pnpm 11 workspace projects, put repo-level dependency resolution overrides in `pnpm-workspace.yaml`; package-level
  overrides can be ignored during lockfile resolution.

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

- Locales are defined in `config/i18n.ts` (single source of truth). Retired prefixes (`hi`, `fil`, `pl`, `th`)
  live in `removedLocaleCodes` and 301 to English via `server/middleware/redirect-removed-locales.ts` (server-only).
- Non-default locales get URL prefixes (`prefix_except_default`). Route rules in `nuxt.config` are mirrored via the
  `mirroredRouteRules()` helper so prefixed paths get the same caching/SSR rules.
- **Known bug**: `canonicalQueries` in the i18n module config is a no-op in v10. A two-part workaround is required:
  1. SSR: `server/plugins/fix-canonical-queries.ts` patches the canonical `<link>` in rendered HTML.
  2. CSR: `app/pages/posts/[domain]/index.vue` uses `useHead` to re-apply the canonical after i18n overwrites it on hydration.
     See the removal checklist in `fix-canonical-queries.ts` for when upstream fixes this.
- **Locale usage analytics (Matomo vs GSC)** — do not conflate them when deciding whether to keep or retire a locale:
  - **Matomo** (`app/plugins/040.matomo.client.ts` tracks `to.fullPath`): all visits to `/{locale}/…` regardless of
    channel (organic, direct, in-app language switch). Bucket `Actions.getPageUrls` by URL prefix for share-of-traffic.
  - **GSC Performance**: organic search clicks/impressions only, attributed to the URL shown in the SERP.
  - A market can have heavy GSC traffic (e.g. Russia) while most clicks land on **unprefixed English** URLs; Matomo
    can still show high `/ru/` share from UX navigation after arrival. Both can be true.
- **GSC locale filters (domain property `sc-domain:r34.app`)** — easy to get false zeros:
  - **Use** Performance → Add filter → Page → **URLs containing** `/ru/` (no trailing `*`).
  - **Do not use** `+/ru/*` or URL params like `page=*%2Fru%2F*` — on this property they report **0** even when
    `Page: +/ru/` shows real traffic (e.g. `/ru/` ~21k clicks / 90d vs `/ru/*` falsely 0).
  - **Country → Pages** is the right cross-check: filter by country (e.g. Russia), open Pages tab, scan for
    `/{locale}/` URLs in the top list.
  - **Insights/blog paths** can overlap locale filters (e.g. `/insights/it/…` vs `/it/posts/…`). Retired-locale 301s in
    `server/middleware/redirect-removed-locales.ts` only match root prefixes `^/(code)(/|$)`, so `/insights/{code}/` is
    unaffected.
- **Locale portfolio discipline** — each active locale is ongoing translation, QA, and SEO surface area. Do not expand
  the locale list without GSC evidence of organic demand. Retire prefixes with negligible prefixed-URL GSC traffic via
  `removedLocaleCodes` + permanent 301 (e.g. `hi`/`fil`/`pl`/`th` were <100 GSC clicks each per 90d while `es`/`ru`
  are ~40k/27k). Keep `it` when blog paths (`/insights/it/…`) carry most of the signal even if `/it/posts/` is small.

### Server-first defaults

Prefer Nitro/server for URL, SEO, and redirect behavior unless the feature genuinely needs client interactivity.
Crawlers, bookmarks, and cold loads should get the correct response on the first HTTP round-trip — not after Vue Router
or client middleware runs.

- **Permanent redirects are server-only** — use Nitro middleware + `sendRedirect(..., 301)`. Do not duplicate the same
  redirect in `app/middleware/*.global.ts`; that ships client logic crawlers never need and can disagree after hydration.
- **Do not add client middleware “for parity”** when the server already handles the case. Retired-locale redirects are
  the reference pattern: one file, `server/middleware/redirect-removed-locales.ts`, inlined and config-driven.
- **Head/meta without a hydration bug** should run on the server (`import.meta.server` in `app/app.vue`, Nitro plugins,
  SSR `useSeoMeta` in pages). Client re-application is only for known i18n overwrite cases (canonical workaround).
- **SEO equity lives on the wire** — canonicals, 301 targets, and production `link rel="canonical"` must be correct in
  SSR HTML. Client-only fixes are invisible to many crawlers and waste first-load JS.

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
- Gelbooru media is routed through Cloudflare Worker media proxies before imgproxy because Gelbooru rate-limits the VM
  egress IP. Worker fetches must use clean upstream headers instead of forwarding inbound `CF-*`, `X-Forwarded-*`,
  `X-Real-IP`, cookies, or authorization headers; leaked caller metadata can make imgproxy fetches return `429`.

### Headless UI

- Do not add `provideHeadlessUseId` in `app/app.vue` while the project uses Vue 3.5+ and `@headlessui/vue` 1.7.23+; those
  versions use Vue's native `useId` and the Nuxt Headless UI workaround is only for older versions.

### Toasts

- `useLazyToast()` lazy-loads `vue-sonner` and renders `ClientToaster` on first use. The first toast must wait for
  `ClientToaster` to mount before calling `toast.*`; a plain `nextTick()` can fire before `<LazyClientToaster>` has
  finished loading and silently drop the toast.

### Dialogs

- When a premium prompt is triggered from inside a bottom sheet or dialog, let the sheet/dialog owner close the local UI,
  open the premium prompt, and restore the local UI after the prompt closes. Opening the premium prompt directly from a
  nested child can leave stacked Headless UI dialogs that require multiple close clicks.

### Performance

- **Server over client when equivalent** — every global route middleware, duplicated redirect helper, and client-only SEO
  shim is bundle + hydration cost on routes that never needed it. Default to Nitro middleware, server plugins, and SSR
  head tags; reach for `app/middleware` only when SPA navigation truly requires client-side routing behavior.
- Prefer high-impact, measurable optimizations over small rewrites. Keep battle-tested dependencies unless replacing one
  has a clear, measured payoff.
- Preserve interaction-gated loading for post UI features: components, composables, and heavy dependencies that are only
  needed after a user opens a menu/sheet/dialog should stay behind Nuxt `Lazy*` components, dynamic imports, or similarly
  deferred boundaries instead of entering the first-load route chunk.
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
- Static `URL.parse()` / `URL.canParse()` browser support comes from `@teages/nuxt-legacy` `customPolyfills` and
  `app/polyfills/url-static-methods.ts`. Do not re-add `@vitejs/plugin-legacy` URL polyfill config for this path; it
  can emit extra legacy assets without loading the modern URL static-method polyfill before the app entry.

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
- Plain Vitest suites that import app modules directly do not get Nuxt's runtime alias resolution; keep repository/pure
  modules importable through relative paths or import them directly from their app path in those suites.
- **`@nuxt/test-utils` `$fetch` has no `.raw`** — it is a path-resolving wrapper around `ofetch`. For redirect status
  and `Location` headers, use `fetch` from `@nuxt/test-utils` with `{ redirect: 'manual' }` (see
  `test/server/redirect-removed-locales.test.ts`).
- Locale-related tests should import `localeCodes`, `prefixedLocaleCodes`, and `removedLocaleCodes` from `config/i18n`
  (or `vi.mock('~~/config/i18n', () => import('../../config/i18n'))`) instead of hardcoding locale lists.
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
- Premium auth transitions are reload-backed in the dashboard/sign-in flow, so premium sync state does not need
  per-user owner scoping in `useState`; rely on the page reload to clear memory state instead of tracking PocketBase
  user ids.
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
