# PayGlocal UI — public documentation site

## Run locally

From the **repository root** (parent of `apps/`):

```bash
npm install
npm run dev:ui-docs
```

Alias: `npm run dev:docs` (same command).

Open **http://localhost:3002** — it redirects to **`/docs`**.

### Common mistake

- **`npm run dev`** starts the **merchant dashboard** on **port 3000**, not this app.
- This app only runs when you use **`dev:ui-docs`** / **`dev:docs`**.

### Port already in use (`EADDRINUSE`)

Default dev port is **3002**. Free it or pick another:

```bash
# macOS — see what holds 3002, then stop it (replace PID)
lsof -i :3002
kill -9 <PID>
```

Or use a different port:

```bash
cd apps/payglocal-ui-docs
npx next dev --port 3030
# → http://localhost:3030/docs
```

## Deploy

See **`design-system/HOSTING.md`** — Vercel **Root Directory**: `apps/payglocal-ui-docs`.
