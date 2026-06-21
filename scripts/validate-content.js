#!/usr/bin/env node
/**
 * Post-generation content gate.
 *
 * Runs in CI after generate-blog-content.js / generate-blog-index.js /
 * generate-rss.js have emitted their JSON indexes, downloaded images, and RSS
 * feed. Catches the failure modes that otherwise ship silently:
 *
 *   CHECK A (integrity) — every index entry's `folder` exists on disk under the
 *     matching content dir and contains a post.json. A missing folder means the
 *     index references content that was never written.
 *
 *   CHECK B (expiring URLs, CRITICAL) — Notion serves file/image/video blocks as
 *     S3 signed URLs that expire ~1h after the build, and stores their
 *     `expiry_time`. These must never reach the RENDERED DISCOVERY SURFACES
 *     (the blog/notes indexes that feed cards + the RSS feed) — a leak there
 *     breaks every card/feed thumbnail an hour after deploy, the exact recurring
 *     bug this gate makes impossible. ANY match there is a HARD failure.
 *     Per-post `post.json` files are scanned too but only WARNED on: they retain
 *     Notion's raw `cover` object and (until file-blocks are localized) signed
 *     file-attachment URLs — a known, separately-tracked issue that should not
 *     block the auto-deploy on otherwise-healthy content.
 *
 *   CHECK C (drift guard) — if the new published count dropped sharply vs the
 *     previously committed index, a transient Notion failure probably
 *     un-published content silently. Fail rather than deploy a gutted site.
 *
 * Dependency-free (fs, path, child_process only). Exit 0 if all checks pass,
 * exit 1 with a summary otherwise. Usable as `node scripts/validate-content.js`
 * with no args — it validates whatever index files exist.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Canonical content dirs. These are fixed by the site layout (the blog lives at
// public/posts, notes at public/notes), so CHECK A resolves each index's
// `folder` entries against the right dir regardless of what POSTS_DIR happens to
// be exported as in the CI step that invokes this gate (otherwise a notes-step
// `POSTS_DIR=public/notes` would make blog-index folders resolve against the
// wrong dir and throw false integrity failures).
const BLOG_DIR = 'public/posts';
const NOTES_DIR = 'public/notes';
// POSTS_DIR is still honored for the env-driven simple index path, matching the
// generator scripts' convention (INDEX_OUTPUT defaults to <POSTS_DIR>/index.json).
const POSTS_DIR = process.env.POSTS_DIR || BLOG_DIR;

// Substrings that betray an expiring / signed Notion URL or its metadata. ANY
// match in a shipped JSON or the RSS feed fails CHECK B. Exported for visibility
// and so a test could assert against the exact list.
const EXPIRING_URL_SIGNATURES = [
  'X-Amz-Expires',
  'expiry_time',
  'secure.notion-static.com',
  'X-Amz-Signature',
];

// Drift guard: fail if the published count drops by more than max(2, 10%).
const DRIFT_MIN_ABSOLUTE = 2;
const DRIFT_FRACTION = 0.10;

// Each index file plus the content dir its `folder` entries live under. Use
// canonical dirs (not POSTS_DIR) for the well-known indexes so CHECK A is
// invocation-independent. Dedupe is handled by INDEX_TARGETS being scanned
// individually; a path that doesn't exist is simply skipped.
const INDEX_TARGETS = [
  { index: 'public/blog-index.json', dir: BLOG_DIR },
  { index: 'public/notes-index.json', dir: NOTES_DIR },
  { index: path.join(BLOG_DIR, 'index.json'), dir: BLOG_DIR },
  { index: path.join(NOTES_DIR, 'index.json'), dir: NOTES_DIR },
];

const failures = [];
function fail(check, message) {
  failures.push(`[${check}] ${message}`);
}

// Read + parse a JSON file; returns null (and records a failure) on problems.
function readJson(filePath, check) {
  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    fail(check, `could not read ${filePath}: ${error.message}`);
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    fail(check, `could not parse ${filePath}: ${error.message}`);
    return null;
  }
}

// Pull the entry list from either index shape: full index (`.posts.all`) or the
// simple index (`.posts` array).
function collectEntries(index) {
  if (!index || typeof index !== 'object' || !index.posts) return [];
  if (Array.isArray(index.posts)) return index.posts;
  if (Array.isArray(index.posts.all)) return index.posts.all;
  return [];
}

// Recursively list every post.json under a content dir (depth 1 is the norm,
// but be defensive).
function findPostJsonFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (error) {
    return results;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findPostJsonFiles(full));
    } else if (entry.isFile() && entry.name === 'post.json') {
      results.push(full);
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// CHECK A: index/folder integrity
// ---------------------------------------------------------------------------
function checkIntegrity() {
  for (const { index, dir } of INDEX_TARGETS) {
    if (!fs.existsSync(index)) continue; // only validate what exists

    const parsed = readJson(index, 'CHECK A');
    if (!parsed) continue;

    const entries = collectEntries(parsed);
    for (const entry of entries) {
      const folder = entry && entry.folder;
      if (!folder) {
        fail('CHECK A', `${index}: entry "${entry && (entry.slug || entry.title || entry.id)}" has no "folder"`);
        continue;
      }
      const folderPath = path.join(dir, folder);
      if (!fs.existsSync(folderPath) || !fs.statSync(folderPath).isDirectory()) {
        fail('CHECK A', `${index}: folder missing on disk: ${folderPath}`);
        continue;
      }
      const postJson = path.join(folderPath, 'post.json');
      if (!fs.existsSync(postJson)) {
        fail('CHECK A', `${index}: ${folderPath} has no post.json`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// CHECK B: no expiring / signed Notion URLs in shipped output
// ---------------------------------------------------------------------------
// Rendered discovery surfaces — a leak here breaks cards/feeds for every
// visitor, so it's a HARD failure.
function gatherHardCheckBFiles() {
  const files = new Set();
  for (const candidate of [
    'public/blog-index.json',
    'public/notes-index.json',
    path.join(BLOG_DIR, 'index.json'),
    path.join(NOTES_DIR, 'index.json'),
    'public/rss.xml',
  ]) {
    if (fs.existsSync(candidate)) files.add(candidate);
  }
  return [...files];
}

// Per-post payloads — scanned for visibility but only WARNED on (retained raw
// `cover` metadata + not-yet-localized file-attachment URLs are a known,
// separately-tracked issue; don't block deploy on them).
function gatherWarnCheckBFiles() {
  const files = new Set();
  const scanDirs = [...new Set([BLOG_DIR, NOTES_DIR, POSTS_DIR])];
  for (const dir of scanDirs) {
    for (const f of findPostJsonFiles(dir)) files.add(f);
  }
  return [...files];
}

function scanForSignatures(file) {
  let content;
  try {
    content = fs.readFileSync(file, 'utf8');
  } catch (error) {
    return { error: error.message, hits: [] };
  }
  const hits = EXPIRING_URL_SIGNATURES.filter((sig) => content.includes(sig));
  return { error: null, hits };
}

function checkExpiringUrls() {
  // Hard surfaces.
  for (const file of gatherHardCheckBFiles()) {
    const { error, hits } = scanForSignatures(file);
    if (error) {
      fail('CHECK B', `could not read ${file}: ${error}`);
      continue;
    }
    for (const sig of hits) {
      fail('CHECK B', `${file} contains expiring-URL signature "${sig}" (rendered discovery surface)`);
    }
  }
  if (failures.filter((f) => f.startsWith('[CHECK B]')).length === 0) {
    console.log('✓ CHECK B: rendered discovery surfaces (indexes + RSS) carry no expiring URLs.');
  }

  // Soft surfaces — warn only.
  let warnFiles = 0;
  for (const file of gatherWarnCheckBFiles()) {
    const { hits } = scanForSignatures(file);
    if (hits.length) warnFiles++;
  }
  if (warnFiles > 0) {
    console.warn(
      `⚠️  CHECK B (warn): ${warnFiles} post.json file(s) still embed expiring-URL metadata ` +
        `(raw Notion cover and/or un-localized file-attachment blocks). Non-blocking — track separately: localize file blocks + strip retained cover signatures.`
    );
  }
}

// ---------------------------------------------------------------------------
// CHECK C: drift guard vs the previously committed index
// ---------------------------------------------------------------------------
function countFromIndexObject(index) {
  if (!index) return null;
  if (index.meta && typeof index.meta.total_posts === 'number') {
    return index.meta.total_posts;
  }
  const entries = collectEntries(index);
  return entries.length;
}

function readHeadIndex(gitPath) {
  try {
    const raw = execSync(`git show HEAD:${gitPath}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    if (!raw || !raw.trim()) return null;
    return JSON.parse(raw);
  } catch (error) {
    // No prior version (first run / gitignored / not committed) or unparseable.
    return null;
  }
}

// The published indexes are gitignored, so there's usually no committed git
// baseline. Fall back to the CURRENTLY-DEPLOYED index as the prior — comparing a
// fresh build against what's live is exactly the drift signal we want (a
// transient Notion failure that guts this build vs. the healthy live site).
// Configurable + best-effort: any network problem returns null (skip, never
// false-fail).
const LIVE_BASELINE_BASE = (process.env.BASELINE_URL_BASE || 'https://dimasc.tf').replace(/\/$/, '');

async function readLiveBaseline(localPath) {
  // public/blog-index.json -> https://dimasc.tf/blog-index.json
  const urlPath = localPath.replace(/^public\//, '');
  const url = `${LIVE_BASELINE_BASE}/${urlPath}`;
  if (typeof fetch !== 'function') return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function checkDrift() {
  // Only the full indexes carry meta.total_posts; check both blog and notes.
  const driftTargets = [
    'public/blog-index.json',
    'public/notes-index.json',
  ];

  for (const target of driftTargets) {
    if (!fs.existsSync(target)) continue;

    const current = readJson(target, 'CHECK C');
    if (!current) continue;
    const newCount = countFromIndexObject(current);
    if (newCount == null) continue;

    let previous = readHeadIndex(target);
    let baselineSource = 'committed git baseline';
    if (!previous) {
      previous = await readLiveBaseline(target);
      baselineSource = `live ${LIVE_BASELINE_BASE}`;
    }
    if (!previous) {
      console.log(`ℹ️  CHECK C: no baseline for ${target} (no git history, live unreachable), skipping drift check.`);
      continue;
    }
    const oldCount = countFromIndexObject(previous);
    if (oldCount == null) continue;

    const allowedDrop = Math.max(DRIFT_MIN_ABSOLUTE, Math.ceil(oldCount * DRIFT_FRACTION));
    const drop = oldCount - newCount;
    if (drop > allowedDrop) {
      fail(
        'CHECK C',
        `${target}: post count dropped from ${oldCount} to ${newCount} (drop ${drop} > allowed ${allowedDrop}; baseline: ${baselineSource}). ` +
          `Likely a transient Notion failure silently unpublishing content.`
      );
    } else {
      console.log(`✓ CHECK C: ${target} count ${oldCount} -> ${newCount} (within tolerance, allowed drop ${allowedDrop}; baseline: ${baselineSource}).`);
    }
  }
}

// ---------------------------------------------------------------------------
// CHECK D: duplicate slugs (WARN) — two entries that slugify to the same path
// shadow each other (only one /<slug>/ page is generated), silently dropping a
// post/note. Warn-only: it's a pre-existing generator slug-collision class, not
// a reason to block an otherwise-healthy deploy.
// ---------------------------------------------------------------------------
function checkDuplicateSlugs() {
  let dupeGroups = 0;
  for (const { index } of INDEX_TARGETS) {
    if (!fs.existsSync(index)) continue;
    const parsed = readJson(index, 'CHECK D');
    if (!parsed) continue;
    const counts = new Map();
    for (const entry of collectEntries(parsed)) {
      const slug = entry && entry.slug;
      if (!slug) continue;
      counts.set(slug, (counts.get(slug) || 0) + 1);
    }
    const dupes = [...counts.entries()].filter(([, n]) => n > 1);
    for (const [slug, n] of dupes) {
      dupeGroups++;
      console.warn(`⚠️  CHECK D (warn): ${index} has ${n} entries with slug "${slug}" — only one /${slug}/ page is generated; the rest are shadowed.`);
    }
  }
  if (dupeGroups === 0) {
    console.log('✓ CHECK D: no duplicate slugs.');
  }
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
async function main() {
  console.log('🔎 Validating generated content...');
  checkIntegrity();
  checkExpiringUrls();
  await checkDrift();
  checkDuplicateSlugs();

  if (failures.length === 0) {
    console.log('✅ Content validation passed (integrity, expiring URLs, drift).');
    process.exit(0);
  }

  console.error(`\n❌ Content validation FAILED with ${failures.length} problem(s):`);
  for (const message of failures) {
    console.error(`   - ${message}`);
  }
  console.error('\nExpiring-URL signatures checked (CHECK B):');
  console.error(`   ${EXPIRING_URL_SIGNATURES.join(', ')}`);
  process.exit(1);
}

if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Content validation crashed:', error && error.message ? error.message : error);
    process.exit(1);
  });
}

module.exports = {
  EXPIRING_URL_SIGNATURES,
  DRIFT_MIN_ABSOLUTE,
  DRIFT_FRACTION,
};
