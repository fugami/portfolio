// One-time migration: push everything in public/uploads to Supabase Storage
// and rewrite /uploads/... references in data/store.json to the new public
// URLs. Run AFTER creating a Supabase project and filling in .env.local:
//
//   node scripts/migrate-media.mjs
//   npm run publish-content   # sync seed.json, then commit + push
//
// Idempotent: re-running upserts files and skips already-rewritten URLs.
// Note: Supabase's free tier caps single files at 50MB — larger videos are
// reported at the end and must be hosted elsewhere (or the plan upgraded).

import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import path from "path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const UPLOADS_DIR = path.join(ROOT, "public", "uploads");
const STORE_PATH = path.join(ROOT, "data", "store.json");
const BUCKET = "media";

const TYPES = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".gif": "image/gif", ".webp": "image/webp", ".svg": "image/svg+xml",
  ".mp4": "video/mp4", ".mov": "video/quicktime", ".webm": "video/webm",
};

async function loadEnv() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) return;
  try {
    const raw = await fs.readFile(path.join(ROOT, ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch {
    /* fall through to the check below */
  }
}

await loadEnv();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (set them in .env.local)."
  );
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });

// Ensure the public bucket exists.
{
  const { data: buckets } = await sb.storage.listBuckets();
  if (!buckets?.some((b) => b.name === BUCKET)) {
    const { error } = await sb.storage.createBucket(BUCKET, { public: true });
    if (error) {
      console.error(`Could not create bucket "${BUCKET}": ${error.message}`);
      process.exit(1);
    }
    console.log(`Created public bucket "${BUCKET}".`);
  }
}

const files = (await fs.readdir(UPLOADS_DIR)).filter((f) => f !== ".gitkeep");
const urlByName = new Map();
const failed = [];

for (const [i, name] of files.entries()) {
  const filePath = path.join(UPLOADS_DIR, name);
  const bytes = await fs.readFile(filePath);
  const contentType = TYPES[path.extname(name).toLowerCase()] ?? "application/octet-stream";
  process.stdout.write(`[${i + 1}/${files.length}] ${name} (${(bytes.length / 1e6).toFixed(1)}MB)… `);

  const { error } = await sb.storage
    .from(BUCKET)
    .upload(name, bytes, { contentType, upsert: true });
  if (error) {
    console.log(`FAILED: ${error.message}`);
    failed.push({ name, reason: error.message });
    continue;
  }
  urlByName.set(name, sb.storage.from(BUCKET).getPublicUrl(name).data.publicUrl);
  console.log("ok");
}

// Rewrite store.json references for everything that made it up.
let store = await fs.readFile(STORE_PATH, "utf8");
let rewritten = 0;
for (const [name, publicUrl] of urlByName) {
  const before = store;
  store = store.split(`/uploads/${name}`).join(publicUrl);
  if (store !== before) rewritten++;
}
await fs.writeFile(STORE_PATH, store, "utf8");

console.log(`\nUploaded ${urlByName.size}/${files.length} files; rewrote ${rewritten} referenced paths in data/store.json.`);
if (failed.length) {
  console.log(`\nFailed (host these elsewhere or raise the plan's file-size cap):`);
  for (const f of failed) console.log(`  - ${f.name}: ${f.reason}`);
}
console.log(`\nNext: npm run publish-content, then commit + push.`);
