# Sera One — art direction, information architecture and design system

This file records the decisions behind the site. Change the system here first, then in code.

## Stage 1 — Art direction

### The idea: the horizon line and the drawing board
The supplied logo sits above a single glowing horizon line. That line is the site's one signature device: it marks
"what's next". It appears under the hero headline, between major chapters and in the closing statement, and nowhere
else, so it keeps its weight.

Everything that explains technology is drawn like an **engineering schematic**: hairline strokes, measured
annotations, mono labels, coordinates, nodes and flows. No stock photography, no 3D blobs, no invented app
screenshots. Schematics are honest about projects that are still in development: they show *how a system works*,
not a finished product that doesn't exist yet.

### What we deliberately avoid
- Gradient-mesh "AI startup" backgrounds, glassmorphism everywhere, neon glows on every element.
- Rows of three identical icon cards. Lists are indexes (studio style), comparisons are spec sheets.
- Fake numbers. The only animated numbers are live price estimates that really change.
- African pattern decoration. Relevance comes from the projects (Zimbabwean farms, roads, businesses).
- Sci-fi display fonts. The logo is extended and geometric; the type echoes that without imitating it.

### Colour
| Token | Value | Use |
|---|---|---|
| `void` | `#05060B` | page background (matches the logo artwork) |
| `deep` | `#0A1020` | raised dark surfaces, the near-black navy |
| `line` | white 9% | hairlines on dark |
| `signal` | `#1A86FA` | the logo's blue: links, active states, the horizon line |
| `paper` | `#F1F0EB` | the commercial chapter (Sera Tech services and pricing) |
| `ink` | `#0A1020` | text on paper |

Division accents are used only as a dot, a hairline and the schematic's highlight colour — never as backgrounds:
Sera Tech `signal` blue · AgriSera `#5FCB7E` · Sera Energy `#C6EE4A` · Sera Home `#D9A56E` ·
Sera Assistants `#7FB4FF` · Sera Front Desk `#9C9BFF`.

The dot comes from the logo (the dot under the A). Every division is introduced by its dot.

### Typography
- **Display:** Archivo, expanded width (wdth 112–125), weights 600–700, uppercase, tight leading (0.9), slight negative
  tracking. Extended geometric forms echo the wordmark without becoming a sci-fi face.
- **Text:** Archivo at normal width, 400/500. One family keeps the system quiet.
- **Technical labels:** IBM Plex Mono, uppercase, 11–12px, tracked +8%: status tags, annotations, indexes.
- Scale (fluid with `clamp`): display-xl 56→168px, display-l 40→104px, display-m 30→64px, title 22→30px,
  body-l 18→21px, body 16px, label 11–12px.

### Space and grid
- 12-column grid, max 1440px, gutters 16px (phone) → 40px (desktop).
- Section rhythm: 96px (phone) → 192px (desktop) between chapters. Generous whitespace is the luxury signal.
- Radius is small (2–6px). Premium engineering, not bubbly SaaS.

### Motion principles
1. **Motion explains a system or confirms an action.** Data pulses run along ecosystem lines because data really
   flows; the pipeline line fills because work moves forward; the price counts because the estimate changed.
2. Entrances are short (500–800ms), ease-out, translate ≤ 24px. Never bounce.
3. One cinematic moment per page at most (home: the Front Desk call sequence).
4. `prefers-reduced-motion`: everything is shown in its final state; smooth scrolling is off.

### Library roles (and the ones left out)
- **Motion**: entrances, hover states, layout transitions, number tweening, magnetic CTA.
- **GSAP + ScrollTrigger**: the scroll-scrubbed innovation pipeline and the timed Front Desk call sequence.
- **Lenis**: smooth wheel scrolling on desktop only, synchronised with ScrollTrigger; off for touch and reduced motion.
- **shadcn/ui (Base UI)**: accessible primitives (sheet, dialog, slider, switch, checkbox, tabs, accordion, inputs).
- **Lucide**: interface icons only (arrows, check, menu). Divisions are never represented by stock icons.
- **Three.js / React Three Fiber — not used.** A 3D scene would add ~600 KB of JS to the first screen for an
  effect the SVG ecosystem already delivers more crisply and accessibly. Revisit only for a product with real 3D
  data (e.g. a field model for AgriSera).
- **Lottie — not used.** There are no designed Lottie files; hand-rolled JSON would be worse than SVG + Motion.

## Stage 2 — Information architecture

```
/                      Home: the full journey (what is Sera One → what it builds → work with us)
/sera-tech             Division: services, process, BikerDash
/agrisera              Division: smart irrigation schematic
/sera-energy           Division: EV charging network for Zimbabwe
/sera-home             Division: smart living
/sera-assistants       Division: AI assistant demos
/sera-front-desk       Division: AI receptionist call flow
/pricing               Websites, apps, software estimator
/start                 Project builder (6 steps) → enquiry
/projects              Sera One Ventures + client projects (CMS)
/projects/[slug]       Project case study (status, stage tracker)
/about                 Honest company story, pipeline, principles
/legal/privacy, /legal/terms
/admin                 Pricing, estimator rates, projects, enquiries (password protected)
```

### Home journey (maps to the brief's "final experience")
1. **What is Sera One?** Hero + ecosystem, "More than one technology".
2. **They build across industries.** Division index.
3. **They're actually building things.** What we're building (BikerDash, Smart Irrigation, Smart EV Charging) with
   status, then the "More is coming" pipeline board.
4. **They build for businesses too.** Paper chapter: Need something built → services → website prices.
5. **Intelligence.** Ecosystem → Sera Assistants → Sera Front Desk.
6. **How they work.** Innovation pipeline.
7. **I can start a project.** Final statement + Start a project. A sticky Start Project button follows on phones.

### Decisions that depart from the brief (and why)
- **Division logos**: only the Sera Technologies lockup was supplied. Divisions are set typographically with
  their dot until their own logos arrive (no invented logos).
- **AgriSera / Sera Energy / Sera Home chapters** live on their division pages rather than repeating on the home
  page, where the projects chapter already features irrigation and EV charging. The home page stays one story.
- **Client projects**: none are published yet, so that list shows an honest empty state; add them in the admin.
- **App and software prices** are proposals, marked as such in the admin; the owner must confirm them.
- **Product name**: the delivery platform is shown as **BikerDash** (the product's own logo and app name). Change
  `VENTURE_NAMES.delivery` in `src/content/site.ts` if the public name should be "BikeDash".

## Stages 3–10 — what was built and what QA changed

- **Design system** (`src/app/globals.css`, `src/components/system/*`): tokens, type scale (`t-display-*`, `t-title`, `t-lead`, `t-label`), the horizon line, drafting grid, CTA, label, status tag, division dot, reveal / mask-line / magnetic / tween motion primitives. shadcn/ui primitives live in `src/components/ui`.
- **Hero**: the stacked headline ends with the logo's blue dot instead of a full stop; the ecosystem is an SVG dial with data pulses, hover/focus/tap readout and an idle walk through the divisions; phones get chips instead of in-drawing labels.
- **Schematics** (`src/components/visuals/schematics.tsx`): irrigation field, delivery map with rider bids, EV charging network and a Sera Home section drawing. Labelled "concept schematic" everywhere.

### Creative-director review (things changed after looking at the built site)
- The home page showed the same three projects three times in a row (showcase, pipeline board, pipeline markers). The board moved to `/projects`; "More is coming" now closes the pipeline section, whose CMS-driven markers still put new projects on the home page.
- The `/projects` board opened on an empty lane on phones; empty lanes now collapse into one honest sentence there.
- Long division names ("Sera Assistants") overflowed the division hero; hero type is now sized from the longest line.
- The header was invisible at the top of the light pricing and builder pages; it is solid there.
- An invented "how we price" list (ownership, staged payments) was replaced with the brief's own trust points, because the owner hasn't stated those policies.

### Bugs found by QA (`pnpm qa`, 139 checks)
- Screen-reader-only text inside swipe rows escaped the scroller and widened phone pages by 58px, pushing the menu button off-screen; positioned containers fixed it, and the overflow check now uses `clientWidth` (mobile `innerWidth` grows to hide the problem).
- The enquiry rate limit counted invalid submissions, so someone correcting form errors could be locked out; only valid enquiries count now.
- `dynamicParams = false` on division routes logged `NoFallbackError` stack traces for every unknown URL; unknown slugs now render the 404 through `notFound()`.
- Server and browser computed slightly different trig values for the dial, causing a hydration mismatch; coordinates are rounded.

## Sera Home: recycling, reuse and upcycling (second round)

- **Story**: Sera Home is now described everywhere as building sustainable homes, spaces and furniture from recycled, reused and upcycled materials: the division page, the home page (new chapter 04 "Discarded. Transformed. Lived in."), the division index and hero readout, the disciplines list, the technology ecosystem, About, the footer and the site description.
- **Real photography** (`src/components/visuals/photo.tsx`, `src/content/photos.ts`): authentic, openly licensed photos from Wikimedia Commons and Flickr, chosen for real places and real use over stock gloss. Every photo carries an "Example" tag plus place, photographer, licence and source, so no other builder's work is presented as Sera Home's. No openly licensed photo of oil-drum furniture exists in those archives, so the drum story pairs real photos of discarded drums and a drum-basin handwashing station with the drawing; Sera Home's own photos should replace these first.
- **Transformation diagram** (`src/components/visuals/upcycle-flow.tsx`): three materials (shipping container, oil drum, reclaimed materials), each drawn through Discarded → Transformed → In use, set between a real "before" photo and real "after" photos, with the five making steps and what the material becomes.
- **Gallery** (`src/components/visuals/reuse-gallery.tsx`): filterable by material with an editorial rhythm of tile sizes.

### Bug found and fixed in this round
Reduced-motion visitors got a hydration mismatch, and after the first fix headings stayed hidden behind their masks. Animations no longer change their starting state with the motion preference (a hydration-safe `useReducedMotion` in `src/components/system/reduced-motion.ts`); instead `MotionGlobalConfig.instantAnimations` makes every animation instant for those visitors. QA now checks reduced motion for console errors and for headings left behind their masks.
