# Hosting Atlas like shadcn/ui (Vercel)

[shadcn/ui](https://ui.shadcn.com) ships its docs as a **public Next.js site** on **Vercel**: fast routes, sidebar + TOC, live previews, and shareable links. Atlas follows the same idea in **`apps/atlas-docs`**.

## What you get in production

- **Routes** — `/` redirects to `/design`; component pages under `/design/*` (same shape as before).
- **UI** — Three-column doc layout (nav, content, “On this page”), light/dark toggle, optional GitHub + “Back to app”.
- **SEO / sharing** — `sitemap.xml`, `robots.txt`, Open Graph + Twitter metadata, generated **`opengraph-image`** (1200×630) for link previews.

## One-time: create the Atlas project on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New…** → **Project**.
2. **Import** your Git repository (`payglocal-gcc` or your fork).
3. Under **Configure Project**:
   - **Root Directory** → **Edit** → set to **`apps/atlas-docs`** → **Continue**.
   - **Framework Preset** should detect **Next.js**.
   - **Build Command** and **Install Command** are read from **`apps/atlas-docs/vercel.json`** (`install` runs at the **monorepo root** so `file:../../packages/payglocal-ui` resolves).
4. **Environment variables** (Production / Preview as you prefer):

   | Variable | Required | Purpose |
   |----------|----------|---------|
   | **`NEXT_PUBLIC_ATLAS_SITE_URL`** | Recommended for production | Canonical site URL, no trailing slash, e.g. `https://atlas.payglocal.com`. Fixes Open Graph and sitemap URLs on your custom domain. If omitted, Vercel still sets `VERCEL_URL` for previews. |
   | **`NEXT_PUBLIC_ATLAS_GITHUB_URL`** | Optional | Repo URL → GitHub icon in the header. |
   | **`NEXT_PUBLIC_MAIN_APP_URL`** | Optional | Dashboard URL → **Back to app** link (e.g. `https://app.payglocal.com`). |

5. **Deploy**. First build should succeed if the repo root has **`package-lock.json`** (`npm ci`).

## Custom domain (e.g. `ui.` or `atlas.`)

1. Vercel project → **Settings** → **Domains**.
2. Add **`atlas.yourdomain.com`** (or **`ui.yourdomain.com`**) and complete DNS (CNAME / A records as Vercel shows).
3. Set **`NEXT_PUBLIC_ATLAS_SITE_URL`** to that same origin (e.g. `https://atlas.yourdomain.com`) and **redeploy** so metadata and sitemap use the stable URL.

## Optional: redirect `/design` from the main app

On the **dashboard** Vercel project (repo root, default Next app):

1. **Settings** → **Environment Variables** → add **`ATLAS_DOCS_BASE_URL`** = your Atlas URL, e.g. `https://atlas.yourdomain.com` (no trailing slash).
2. Redeploy the dashboard. **`next.config.ts`** redirects **`/design`** and **`/design/*`** to that site.

## Local commands (monorepo root)

```bash
npm install
npm run dev:atlas    # http://localhost:3001 → /design
npm run build:atlas
```

## Troubleshooting

- **Install fails** — Ensure deploy uses the **repo root** lockfile. Root Directory must be **`apps/atlas-docs`** with **`vercel.json`** `installCommand`: `cd ../.. && npm ci`.
- **Wrong links in OG / sitemap** — Set **`NEXT_PUBLIC_ATLAS_SITE_URL`** on Atlas after you attach a custom domain.
- **Two projects** — Keep **Atlas** and the **dashboard** as separate Vercel projects from the same repo (different Root Directory). Same pattern as running multiple apps from one monorepo.

### Vercel shows `404: NOT_FOUND` (plain Vercel page, not your Next.js UI)

That usually means **this project is not serving a Next app from the path Vercel expects**. Check in order:

1. **Root Directory** (Project → Settings → General): for **Atlas only**, set **`apps/atlas-docs`**. If it is **`.`** (repo root), you get the **dashboard** app — `/` should work; use **`/design`** only if you did **not** remove those routes (this repo serves Atlas from **`apps/atlas-docs`** only).
2. **Clear overrides** (Settings → General → Build & Development): **Build Command** and **Output Directory** should be **empty** so Vercel uses **`apps/atlas-docs/vercel.json`**. If someone set Build to `npm run build:atlas` while Root is **`.`**, the output lands in the wrong place → **NOT_FOUND**.
3. **Redeploy** after fixing Root Directory / build settings.
4. Monorepo tracing: **`apps/atlas-docs/next.config.ts`** sets **`outputFileTracingRoot`** to the repo root so `packages/payglocal-ui` is included on Vercel.

## Where the code lives

| Path | Role |
|------|------|
| **`apps/atlas-docs/`** | Next.js docs app |
| **`apps/atlas-docs/vercel.json`** | Monorepo install + build |
| **`packages/payglocal-ui/`** | Component source (linked via `file:`) |

## Security

Atlas can stay **public** on its own domain while the product app stays **private** or auth-gated — no need to serve `/design` from the dashboard origin.
