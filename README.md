# Jordan Mitchell — Creative Timeline

A one-page portfolio with two tabs (**Projects** / **Roles**), editable individual
project pages, and an open **admin** for managing everything. Built to run with
zero setup today and flip to Supabase when you're ready.

## Run it

```bash
npm install
npm run dev
```

- Site: <http://localhost:3000>
- Admin: <http://localhost:3000/admin>

Content lives in `data/store.json` (seeded from `data/seed.json` on first run).
Edits in the admin write straight to that file — fully working, no database needed.

## How it's built

- **Next.js (App Router)** + **Tailwind**, deploys cleanly to Vercel.
- **Data layer** (`src/lib/data.ts`) reads/writes the local JSON store *or* Supabase —
  the rest of the app never knows the difference.
- **Projects**: chronological list (date · title · type // client). Featured rows get
  the asterisk + hand-drawn box. Each project either hyperlinks out or opens an
  editable Markdown page at `/projects/[slug]`.
- **Roles**: click a row to expand its details.
- **Fonts**: handwriting (`--font-hand`) and EB Garamond for project bodies.
  The handwriting font falls back to Caveat until the Adobe "Ernie" kit is added.

## Going live with Supabase

1. Create a Supabase project and run `supabase/schema.sql` in the SQL editor.
2. Copy `.env.local.example` → `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only; used for admin writes + uploads)
3. Restart. The admin badge will read **“Supabase connected.”** Images now upload to
   the `media` storage bucket instead of `public/uploads`.

> Seed your tables by copying the rows from `data/store.json`, or paste your real
> content into the admin once connected.

## Adobe "Ernie" font

The design specifies Adobe Handwriting / Ernie (a paid Adobe Fonts face). Add your
Adobe Fonts **web project (kit) ID** as `NEXT_PUBLIC_ADOBE_KIT_ID` and it loads
automatically — the CSS already prefers `"ernie"` ahead of the free fallback.

## Notes / not yet done

- **Admin auth**: intentionally open for now. Add Supabase Auth (or a password gate)
  before deploying publicly.
- The local JSON store is for development. On Vercel the filesystem is ephemeral, so
  connect Supabase before relying on admin edits in production.
