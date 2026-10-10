# Kesera Technologies — website

The website for Kesera Technologies Holdings: the six divisions, Kesera Ventures (BikerDash, Smart Irrigation, Smart EV Charging), Sera Tech's services and pricing, a six-step project builder, and an admin for prices, projects and enquiries.

Design decisions (art direction, information architecture, motion rules, what was left out and why, and what QA changed) are in [docs/DESIGN.md](docs/DESIGN.md).

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui on Base UI · Motion · GSAP + ScrollTrigger · Lenis · Lucide · zod · SQLite through Node's built-in `node:sqlite` (no native dependency).

## Run it

Node 22.13 or later, and pnpm.

```bash
pnpm install
cp .env.example .env.local     # then set ADMIN_PASSWORD and ADMIN_SESSION_SECRET
pnpm dev                       # http://localhost:3000
```

The database (`data/sera.db`) is created and seeded on first use with the website prices, the proposed app prices, the estimator rates and the three ventures.

| Command | What it does |
|---|---|
| `pnpm dev` | development server |
| `pnpm build` / `pnpm start` | production build and server |
| `pnpm typecheck` | route types + TypeScript |
| `pnpm test` | unit tests for the pricing maths (vitest) |
| `pnpm qa` | browser QA against a running site (`QA_URL`, default `http://localhost:3100`); uses installed Edge (`QA_BROWSER=chrome` for Chrome). It submits one test enquiry and briefly changes one price, then restores it. |

## Admin

`/admin` (password from `ADMIN_PASSWORD`):

- **Enquiries**: everything sent from the project builder, with the server-computed estimate and a status (new, contacted, quoted, won, closed).
- **Pricing**: website and app packages (price, "From", "+", highlight label, what's included) and every estimator rate. Plans flagged "proposal" are prices still to be confirmed.
- **Projects**: the CMS behind Kesera Ventures, the home page pipeline, the projects page and each division page. Add a project, set its status, publish it.

Saving publishes immediately (the affected pages are regenerated).

To be emailed each enquiry, set `RESEND_API_KEY`, `LEADS_NOTIFY_EMAIL` and `LEADS_FROM_EMAIL` (a domain verified in Resend). Without them, enquiries are still stored and listed in the admin.

## Deploying

Any Node host that keeps a disk: a VPS, Railway or Render with a volume, Fly.io with a volume, or Docker. Set `DATA_DIR` to the persistent path, plus `SITE_URL`, `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`. Serverless hosts without a disk (e.g. Vercel) need the data layer in `src/lib/db.ts` moved to a hosted database first; it is the only file that touches storage.

## Content that needs the owner

- **App prices** (App Starter $600, App Pro $1,500, App Advanced $3,500, Custom from $5,000) and all estimator rates are proposals. Confirm or change them in the admin, then untick "proposal".
- **Division logos**: only the Kesera Technologies artwork was supplied. Divisions are set in type with their accent dot until their logos arrive.
- **Product name**: the delivery platform is shown as BikerDash. Change `VENTURE_NAMES.delivery` in `src/content/site.ts` if it should be "BikeDash".
- **Legal pages** are plain-language starting points; have them reviewed (Zimbabwe's Cyber and Data Protection Act) before launch.
- **Client projects**: none are published. Add them in the admin once clients agree.
- **Sera Home photos**: the site uses 16 real, openly licensed photographs of reuse from around the world (Benin, Kenya, Ethiopia, Cuba, France, the UK and more), each credited and labelled "Example", because they are not Sera Home's work. Sera Home's own photos (container homes and gyms, oil-drum chairs and tables, handwashing stations, before-and-after shots) will be far stronger: add them as described in `src/content/photos.ts` and they are captioned as Sera Home's own.

## Photos

`src/content/photo-sources.json` lists every photograph with its source, photographer, licence, place and caption; `node scripts/fetch-photos.mjs` downloads them into `public/photos/` and records their sizes. Captions on the site always show the credit and licence (required by the CC BY and CC BY-SA licences).

## Brand files

`brand/kesera-logo-source.jpg` is the supplied Kesera artwork (`brand/sera-logo-source.jpg` is the retired Sera one). `node brand/extract.cjs` cuts the wordmark out of its backdrop (pixels copied, not redrawn) into `public/brand/`, and `node brand/icons.cjs` builds the favicon, Apple icon and social image from it.
