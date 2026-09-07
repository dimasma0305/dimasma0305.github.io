# Keeping the room useful

The room keeps the full portfolio in `lib/portfolio-data.json`. Short editorial project stories and source links live in `lib/portfolio-stories.ts`; they do not change the 3D room’s object counts.

## Project stories and evidence

The three featured projects have problem/contribution/result text and genuine documentation previews. CTFify’s image is explicitly a README capture, not a fabricated terminal session. VWA-Wazuh’s dashboard is from its public README (`https://i.imgur.com/7aRgoMW.png`). TCP1P Theme is explicitly credited to the team and its CTFd core-beta foundation. No adoption or time-saving numbers were invented.

Project descriptions and linked Patchstack/CTFtime/team pages were checked on 2026-09-07. Patchstack’s profile reports a report count, not a count of distinct CVEs; the intro therefore says “research reports.” The advisory credits the researcher. Team scoreboards establish the team’s placement, not individual attendance. Add evidence per exact achievement event name; unknown sources stay visibly labelled “Portfolio archive.” Do not turn a generic profile link into a verified-award badge.

## Personal desk update

Edit `lib/desk-update.json` with `updatedAt` (ISO date), `building`, `learning`, and `availability` (plain text). Null fields are omitted. Without a valid dated update, the board shows recent published work and invites an availability inquiry. Keep availability accurate; do not automatically stamp the build date as a personal update.

## Note reviews

`lib/note-reviews.json` maps the exact note slug to `{ "reviewedAt": "YYYY-MM-DD", "environment": "Actual versions/environment reviewed", "note": "Optional scope or limitation" }`. Populate only after a real review. The source edit date is not a review date. An empty map intentionally shows “Review status: not recorded.” This UI change does not validate or modify the technical examples.

## Search and saved reading

`/search/` searches published titles, summaries, categories, and tags across projects, posts, and notes. It does not ship article bodies. `q` and `type` URL parameters are shareable; private search data is never included in metrics. Project results use stable `#project-N` anchors from the original project order—keep that order or migrate anchors when reorganizing the data.

Saving is explicit and local, capped at 50 entries. Only saved articles remember a position. Returning to an article offers Continue, without moving the reader automatically. `/reading-list/` manages and clears this data. Browser storage restrictions degrade to a readable page with an explanatory status. These utility pages are noindex.

## Optional measurements: not connected to an analytics backend yet

`/privacy/` provides Off (default), Local, and Share controls. Do Not Track and Global Privacy Control override measurement preferences. Local samples stay in this tab’s session storage, capped at 60. Functional saved reading is independent of optional diagnostics. No banner is necessary to use the site.

To enable opt-in site-wide collection, choose a service you control and build with `NEXT_PUBLIC_METRICS_ENDPOINT=https://your-collector.example/collect`. This is a public HTTPS URL, not a secret; do not put tokens in it. GitHub Pages does not provide a POST endpoint. The Share option stays disabled without a valid endpoint. Nothing is sent until the visitor explicitly selects Share.

Collector contract: JSON POST with `version: 1`, `sample`, `name`, `value`, `page`, `viewport`, `motion`, and `room`. Names are LCP/INP/CLS, page_view, allowlisted room chapters, contact_link, or repository_link. Page is a broad category, never a path or query. Vitals use the standard web-vitals library and refer to the document visit, not individual Next.js client routes. LCP/INP are milliseconds; CLS is unitless. Some metrics report only after interaction or page visibility changes; missing INP is not a score of zero.

Allow CORS from the production origin, validate the schema, rate-limit, and upsert repeated `sample` keys. Sample keys identify an individual measurement, not a persistent visitor. Requests omit credentials and referrers, but the server still sees network metadata: strip IPs from application/proxy logs, define retention and access controls, and review the privacy copy before enabling a provider. Do not present opt-in samples as all visitors or unique visitor counts. Do not infer that a chapter was read just because it became active.

For optimization, group p75 LCP/INP/CLS by screen bucket and rendering mode after enough real samples; compare the share of visits reaching later chapters and contact links. Do not rely on lab Chromium timings as real-phone field data. No aggregate dashboard, account, retention policy, or collection service has been created by this change.
