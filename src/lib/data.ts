// Server-side data access. Reads/writes Supabase when configured, otherwise
// falls back to a local JSON file (data/store.json) seeded from data/seed.json.
// Keeping both behind this module means pages and admin code never branch.

import { promises as fs } from "fs";
import path from "path";
import type { Project, Role, Store } from "./types";
import {
  getSupabaseReadClient,
  getSupabaseWriteClient,
  isSupabaseConfigured,
} from "./supabase";
// Static import so the seed snapshot is bundled into serverless builds, where
// runtime files under data/ don't exist and the filesystem is read-only.
import seedJson from "../../data/seed.json";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

/**
 * True on hosted deployments (Vercel) that have no database configured.
 * Pages serve the seed snapshot committed with the build; writes are rejected.
 */
export function isReadOnlyDeployment(): boolean {
  return Boolean(process.env.VERCEL) && !isSupabaseConfigured();
}

// ---------------------------------------------------------------------------
// Local JSON store (fallback)
// ---------------------------------------------------------------------------

async function readLocalStore(): Promise<Store> {
  if (isReadOnlyDeployment()) {
    // Clone: callers sort/mutate the arrays they get back.
    return structuredClone(seedJson) as unknown as Store;
  }
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as Store;
  } catch {
    // First run: seed the working store from the committed seed file.
    const seed = structuredClone(seedJson) as unknown as Store;
    await writeLocalStore(seed);
    return seed;
  }
}

async function writeLocalStore(store: Store): Promise<void> {
  if (isReadOnlyDeployment()) {
    throw new Error(
      "This deployment is read-only: connect Supabase to edit content online, or edit locally and push."
    );
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

// ---------------------------------------------------------------------------
// Sorting helpers (shared by both backends)
// ---------------------------------------------------------------------------

const byDateDesc = (a: Project, b: Project) => b.date.localeCompare(a.date);
const byStartYearDesc = (a: Role, b: Role) => b.start_year - a.start_year;

// ---------------------------------------------------------------------------
// Public reads
// ---------------------------------------------------------------------------

export async function getProjects(
  opts: { includeUnpublished?: boolean } = {}
): Promise<Project[]> {
  if (isSupabaseConfigured()) {
    const sb = getSupabaseReadClient()!;
    let q = sb.from("projects").select("*").order("date", { ascending: false });
    if (!opts.includeUnpublished) q = q.eq("published", true);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as Project[];
  }
  const store = await readLocalStore();
  return store.projects
    .filter((p) => opts.includeUnpublished || p.published)
    .sort(byDateDesc);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (isSupabaseConfigured()) {
    const sb = getSupabaseReadClient()!;
    const { data, error } = await sb
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return (data as Project) ?? null;
  }
  const store = await readLocalStore();
  return store.projects.find((p) => p.slug === slug) ?? null;
}

export async function getProjectById(id: string): Promise<Project | null> {
  if (isSupabaseConfigured()) {
    const sb = getSupabaseReadClient()!;
    const { data, error } = await sb
      .from("projects")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return (data as Project) ?? null;
  }
  const store = await readLocalStore();
  return store.projects.find((p) => p.id === id) ?? null;
}

export async function getRoles(): Promise<Role[]> {
  if (isSupabaseConfigured()) {
    const sb = getSupabaseReadClient()!;
    const { data, error } = await sb
      .from("roles")
      .select("*")
      .order("start_year", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Role[];
  }
  const store = await readLocalStore();
  return store.roles.sort(byStartYearDesc);
}

// ---------------------------------------------------------------------------
// Admin writes
// ---------------------------------------------------------------------------

export async function upsertProject(project: Project): Promise<void> {
  if (isSupabaseConfigured()) {
    const sb = getSupabaseWriteClient()!;
    const { error } = await sb.from("projects").upsert(project);
    if (error) throw error;
    return;
  }
  const store = await readLocalStore();
  const idx = store.projects.findIndex((p) => p.id === project.id);
  if (idx >= 0) store.projects[idx] = project;
  else store.projects.push(project);
  await writeLocalStore(store);
}

export async function deleteProject(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    const sb = getSupabaseWriteClient()!;
    const { error } = await sb.from("projects").delete().eq("id", id);
    if (error) throw error;
    return;
  }
  const store = await readLocalStore();
  store.projects = store.projects.filter((p) => p.id !== id);
  await writeLocalStore(store);
}

export async function upsertRole(role: Role): Promise<void> {
  if (isSupabaseConfigured()) {
    const sb = getSupabaseWriteClient()!;
    const { error } = await sb.from("roles").upsert(role);
    if (error) throw error;
    return;
  }
  const store = await readLocalStore();
  const idx = store.roles.findIndex((r) => r.id === role.id);
  if (idx >= 0) store.roles[idx] = role;
  else store.roles.push(role);
  await writeLocalStore(store);
}

export async function deleteRole(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    const sb = getSupabaseWriteClient()!;
    const { error } = await sb.from("roles").delete().eq("id", id);
    if (error) throw error;
    return;
  }
  const store = await readLocalStore();
  store.roles = store.roles.filter((r) => r.id !== id);
  await writeLocalStore(store);
}
