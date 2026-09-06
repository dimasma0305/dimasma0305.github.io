# dimasc.tf

The site keeps the **dimasc.tf** identity; the room is its portfolio experience,
not a separate brand. Blog, Notes, Tools, and Services are the primary navigation
on every page. The home-only chapter rail and numbered room tags navigate the
portfolio itself; its "Review desk" stop is distinct from the full Services page.

`lib/site-brand.mjs` owns the angular **d / terminal-prompt** logo and main links.
`components/logo-mark.tsx` and the room header use that same vector. After editing
it, run `bun run generate:brand` to regenerate the SVG, PNG, ICO, and app-icon
exports. These assets are vector-derived, not generated artwork.

The Next.js homepage now uses the approved dark, scroll-directed room: a gaming
workstation and Quest 3, project monitor, writing notebook, photo wall, trophy
cabinet, skills bookshelf, story wall, and service folio. Blog, notes, tools,
search, service details, feeds, and downloads retain their existing routes.

## Editing the portfolio

- `lib/portfolio-data.json`: biography, personas, projects, skills, achievements,
  teams, career history, photos, service copy/pricing, and contact channels. The
  room and retained conventional section components share these records.
- `lib/services-data.ts`: service FAQs shared with the service page and SEO.
- `lib/room/portfolio.ts`: builds the writing library from the published entries
  in `public/blog-index.json` and `public/notes-index.json`. The existing hourly
  content workflow refreshes them; do not hand-edit generated writing indexes.
- `lib/room/content.js`: room chapter HTML and the data summary printed on objects.
- `lib/room/tour.js`: navigation, native-scroll camera path, transitions, and cleanup.
- `lib/room/room.css`: scoped room layout and responsive styles.
- `lib/room/scene/`: shared Three.js geometry, materials, and render budget.
- `public/room/`: production photos, room stills, and asset provenance/license notes.

`components/room-home.tsx` emits complete HTML at build time. Its client enhancer
loads the 3D scene separately and disposes it on route changes. There is no iframe
or production dependency on the preview server. New portfolio records update
HTML and live object surfaces on the next build; regenerate stills after changing
anything visible in the room so lightweight views match.

## Local development and checks

```sh
bun install --frozen-lockfile
bun run dev
```

A clean checkout can render the homepage without writing caches; its library is
empty until the existing content-generation workflow supplies published indexes.
Do not expose Notion credentials to client code.

```sh
bun run typecheck
bun run lint
bun test
NEXT_PUBLIC_BASE_URL=https://dimasc.tf NEXT_PUBLIC_BASE_PATH= bun run build
bun run preview:export
```

The build exports to `out/`. `preview:export` serves that exact artifact at
`http://127.0.0.1:4001`; use `PORT` and `PREVIEW_HOST` to change the binding.
It is a no-cache, no-index inspection server, not the production hosting stack.
`next start` is not used with a static export.

Browser regression checks require a separate Playwright installation and Chromium:

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
CHROMIUM_PATH=/absolute/path/to/chromium \
AXE_MODULE=/absolute/path/to/axe-core/axe.min.js \
bun run test:room-browser
```

`AXE_MODULE` is optional; when supplied it enables the automated accessibility
audit. `ROOM_SITE_URL` overrides the default export preview URL; screenshots go
to `ROOM_SCREENSHOTS` (default `/tmp/portfolio-room-site`). Checks cover desktop,
320/390px touch layouts, native disclosures, writing search, client navigation
cleanup, old section anchors, reduced motion, unavailable WebGL, and no JavaScript.
Automated checks do not replace real-device and screen-reader testing.

`bun run test:site-navigation` uses the same browser environment variables to
check all four navbar destinations and active states at 320, 390, 700, and 1440px,
including keyboard navigation, header clearance, and a no-JavaScript mobile visit.

## Updating room stills and design previews

The optional comparison lab is retained locally in `design-preview/`, outside
the website release commit. The following commands apply to a workspace that
has that lab; a production checkout does not need it. It imports the same room
source; do not edit its generated `site/corner-tour*` or `site/corner-scene.js` bundles.

```sh
npm ci --prefix design-preview
npm --prefix design-preview run build:3d
node design-preview/server.mjs
```

With the preview server running in another terminal:

```sh
npm --prefix design-preview run sync:portfolio
npm --prefix design-preview run render:room-stills
npm --prefix design-preview run build:3d
npm --prefix design-preview run test:portfolio
bun run build
```

The renderer accepts `PLAYWRIGHT_MODULE`, `CHROMIUM_PATH`, and `PREVIEW_URL`.
It creates ten 2048px views, updates `lib/room/stills.js`, and copies the images
to `public/room/assets/room-stills/`. The preview sync fetches public writing
metadata from the published site; production builds instead use their current
local indexes. If you are changing unpublished writing too, regenerate matching
stills once that writing is available to the preview snapshot.

## Accessibility and performance

Content uses semantic headings, native links/disclosures, visible keyboard focus,
and status announcements. Reduced motion uses still room views. WebGL failure
falls back to the same views; without JavaScript the portfolio and photo album
remain readable. On mobile, a compact chapter bar preserves reading space and
the visitor can explicitly expand the room without changing scroll position.

Scrolling stays native. The renderer sleeps when idle or collapsed, limits
in-flight GPU work, lowers resolution during movement, and draws one sharper
settled frame. Persistently slow devices switch to stills. There are no continuous
decorative render loops or wheel/touch scroll interception.

## Publishing

The existing GitHub Pages workflow validates, refreshes content, builds, and
deploys from `main`. Local changes and export previews do not publish themselves;
publishing requires committing and pushing the intended changes to `main`.
