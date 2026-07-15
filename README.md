# DiscVault marketing site

Static marketing site for [DiscVault](https://github.com/helmerzNL/DiscVault),
published at [discvault.eu](https://discvault.eu). It uses Astro, TypeScript and
pnpm and produces a self-contained `dist/` directory.

## Requirements and setup

- Node.js 24 or newer
- Corepack

```sh
corepack install --global pnpm@11.13.0
corepack pnpm install --frozen-lockfile
corepack pnpm hooks:setup
```

The hook setup configures this checkout's `core.hooksPath` to `.githooks`.
There is no runtime configuration and no required `.env` file. Local `.env`
files are ignored.

## Run and stop

```sh
corepack pnpm dev       # local development server
corepack pnpm preview   # preview an existing production build
```

Both servers run in the foreground. Stop them with `Ctrl+C`; `corepack pnpm stop`
prints the same operational instruction because the deployed site has no
server process.

## Build, health and checks

```sh
corepack pnpm build          # reproducible static build in dist/
corepack pnpm health         # build plus links and critical-route smoke checks
corepack pnpm check          # complete release gate
corepack pnpm format         # apply repository formatting
corepack pnpm lighthouse     # local Lighthouse budgets (Chromium required)
```

The complete gate checks formatting, generated Chrome & Blue brand tokens,
Astro/TypeScript, all 20 locale models, the build, internal links, protected
legal/Legacy routes, responsive image output and synchronized versions.

Install the project browser once with
`corepack pnpm exec playwright install chromium` before running Lighthouse.
CI runs performance, accessibility, best-practices and SEO budgets for English,
Dutch and the legal shell.

To inspect a build manually:

```sh
corepack pnpm preview
curl --fail http://localhost:4321/
curl --fail http://localhost:4321/privacy.html
curl --fail http://localhost:4321/legacy/
```

## Architecture and data locations

- `src/pages/` — English `/`, 19 generated `/<locale>/` routes, legal `.html`
  routes and the FAQ compatibility route.
- `src/content/locales/` — one parity-checked marketing content shape per
  locale; `src/content/types.ts` is the typed model.
- `src/content/legal/` — preserved EN/NL legal bodies rendered by one
  accessible Astro legal shell.
- `src/components/` and `src/layouts/` — reusable marketing and shell UI.
- `src/design/tokens.json` — Chrome & Blue v3.1 source imported from
  `Flux76HQ/App-Guidance`; `corepack pnpm brand:build` generates
  `src/styles/tokens.css`.
- `src/assets/showcase/` — temporary source captures optimized by Astro into
  responsive AVIF/WebP build assets.
- `public/legacy/`, `public/images/upgrade-message/` and
  `public/images/v26-migration/` — preserved Legacy page and its proven image
  dependencies.
- `public/` — immutable files copied directly to the build, including `CNAME`,
  robots and official logo assets.
- `dist/` — disposable deployment artifact. Never edit it directly.
- `docs/` — internal App Store reference material; it is not published.

This is a static site. It has no database, writable runtime storage, analytics
or user data.

## Content and brand updates

1. Update the typed locale files and keep every locale at parity.
2. If brand tokens change, replace `src/design/tokens.json`, update
   `src/design/source.json`, then run `pnpm brand:build`.
3. Replace temporary showcase sources in `src/assets/showcase/` while keeping
   the responsive `<Picture>` pipeline.
4. Run `corepack pnpm format` and `corepack pnpm check`.
5. Set the release version idempotently:

   ```sh
   corepack pnpm version:set 1.0.1
   ```

Protected runtime, content, style, asset, script, config, deployment and
workflow paths require `VERSION` to be part of the same staged change.

## Deploy and release channels

Pushing `master` runs the stable Pages workflow. It installs from
`pnpm-lock.yaml`, runs the complete gate and uploads **only `dist/`**.

- Stable releases: `VERSION` and `package.json` use `X.Y.Z`; tag `vX.Y.Z`.
  Stable versions may deploy to Pages.
- Beta releases: version files use `X.Y.Z-beta.N`; tag `vX.Y.Z-beta.N`.
  They create a GitHub prerelease and do not deploy to the production Pages
  channel.

The tag workflow rejects any tag that does not exactly match both version
files.

## Rollback, backup and recovery

There is no runtime data to back up. Git history, release tags and the lockfile
are the complete backup.

To roll back production, redeploy a known-good stable commit from `master` (or
revert the faulty commit and let the Pages workflow rebuild it). To verify a
candidate before deployment, check out its tag, run `corepack pnpm install
--frozen-lockfile && corepack pnpm health`, and compare the generated `dist/`. Do not
restore an old repository-root artifact: Pages must always receive a fresh,
validated `dist/`.
