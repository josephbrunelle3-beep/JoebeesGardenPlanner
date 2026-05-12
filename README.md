# Garden Bed Planner

AI-assisted web app for designing garden beds. Drag plants onto a grid, let Claude design layouts that respect companion planting, soil, sun, and your USDA hardiness zone, and get a seasonal planting/harvest calendar.

Built for **homeowners, homesteaders, and nurseries** that want to help customers plan smarter gardens.

## Stack

- **Next.js 15** (App Router, React 19) + **TypeScript**
- **Tailwind CSS v4**
- **@dnd-kit** for drag-and-drop
- **Zustand** for client state
- **Anthropic Claude** for the AI layout assistant
- **Supabase** for auth + persistence (scaffolded; optional for local dev)

## Getting started

```powershell
# 1. Install deps
npm install

# 2. Copy environment variables and add your keys
Copy-Item .env.example .env.local
#   ANTHROPIC_API_KEY=...          (required for AI features)
#   NEXT_PUBLIC_SUPABASE_URL=...    (optional)
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
#   SUPABASE_SERVICE_ROLE_KEY=...

# 3. Run dev server
npm run dev
```

Open <http://localhost:3000>. The planner lives at `/planner`.

The app works fully offline (without Supabase or Anthropic keys); only the AI layout button requires `ANTHROPIC_API_KEY`.

## Project layout

```
src/
  app/
    page.tsx                  Landing page
    planner/page.tsx          Main planner UI
    api/ai/layout/route.ts    Claude-powered layout endpoint
    layout.tsx, globals.css
  components/
    GardenCanvas.tsx          Drag-and-drop bed grid + issue analysis
    PlantPalette.tsx          Draggable plant library
    Conditions.tsx            Sun / soil / pH / zone / bed size controls
    AIPromptPanel.tsx         "Design my bed" prompt -> Claude
    CalendarView.tsx          Seasonal plant/harvest table
    PlantInfoPanel.tsx        Selected plant details
  lib/
    plants.ts                 Seed plant database (~20 plants)
    companions.ts             Companion / antagonist / condition rules
    store.ts                  Zustand store for the active bed
    ai.ts                     Anthropic client + JSON extraction
    supabase.ts               Lazy Supabase clients (browser + admin)
    types.ts
```

## How the AI assistant works

`POST /api/ai/layout` accepts the bed dimensions, conditions, and a free-text goal. The server-side route sends the entire plant catalog (ids only) to Claude with a strict JSON output contract. The response is validated with Zod, filtered to known plant ids, clamped to the grid, and then dropped into the canvas via the Zustand store. Companion analysis re-runs automatically and surfaces any remaining warnings as inline badges + a list.

## Roadmap

- **Persistence**: save/load gardens per user via Supabase (`gardens` table with RLS).
- **Multiple beds + property map**: arrange beds on a yard layout.
- **Business / white-label mode**: nurseries can scope the plant catalog to their inventory and brand the planner.
- **Mobile app**: React Native client sharing the `lib/` domain logic.
- **Expanded plant DB**: pull from a curated dataset (USDA, Old Farmer's Almanac data) or community contributions.
- **Pest / disease awareness**, **succession planting**, **crop rotation hints**.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript only |

## Deploying to your domain (Vercel)

The fastest way to get this online at **joebees.us** is Vercel. The repo is already configured: SEO metadata, `robots.txt`, `sitemap.xml`, security headers, and long-cache for the JoeBee video are all wired up.

1. **Push the repo to GitHub** (or GitLab/Bitbucket).
2. Go to <https://vercel.com/new>, **import the repo**. Vercel auto-detects Next.js.
3. In the **Environment Variables** step, add:
   - `ANTHROPIC_API_KEY` — your Claude key (required for AI features)
   - `NEXT_PUBLIC_SITE_URL` — `https://joebees.us`
   - (Optional) Supabase keys if you wire up persistence later
4. Click **Deploy**.
5. After the build, open the project → **Settings → Domains** and add `joebees.us` and `www.joebees.us`.
6. At your registrar (where you bought joebees.us), set the DNS records Vercel shows:
   - Apex `joebees.us` → `A` record to Vercel's IP (Vercel shows it)
   - `www.joebees.us` → `CNAME` to `cname.vercel-dns.com`
7. Wait for DNS to propagate (usually minutes). Vercel auto-issues a Let's Encrypt SSL cert.

### After deploy

- Verify <https://joebees.us/robots.txt> and <https://joebees.us/sitemap.xml> resolve.
- Submit the sitemap in Google Search Console for indexing.
- The video at `/JOEBEE.mp4` is served with `Cache-Control: public, max-age=31536000, immutable`.

### Self-hosting alternative

If you want to host on a VPS instead:

```bash
npm run build
npm run start    # listens on PORT (default 3000)
```

Put it behind nginx / Caddy with TLS and proxy `joebees.us` to `localhost:3000`.
