"use server";

import { revalidatePath } from "next/cache";
import type { Project, Role } from "./types";
import {
  upsertProject,
  deleteProject,
  upsertRole,
  deleteRole,
} from "./data";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function revalidateAll(slug?: string | null) {
  revalidatePath("/");
  revalidatePath("/admin");
  if (slug) revalidatePath(`/projects/${slug}`);
}

export async function saveProjectAction(fd: FormData): Promise<void> {
  const id = str(fd, "id") || `p_${crypto.randomUUID()}`;
  const title = str(fd, "title");
  const link_type = (str(fd, "link_type") || "page") as Project["link_type"];

  let slug = str(fd, "slug") || null;
  if (link_type === "page" && !slug) slug = slugify(title) || id;

  const project: Project = {
    id,
    date: str(fd, "date") || new Date().toISOString().slice(0, 10),
    title,
    type: str(fd, "type"),
    role: str(fd, "role"),
    client: str(fd, "client"),
    featured: fd.get("featured") === "on",
    link_type,
    external_url: link_type === "external" ? str(fd, "external_url") || null : null,
    slug: link_type === "page" ? slug : null,
    cover_image: str(fd, "cover_image") || null,
    content: link_type === "page" ? str(fd, "content") || null : null,
    published: fd.get("published") === "on",
  };

  await upsertProject(project);
  revalidateAll(project.slug);
}

export async function deleteProjectAction(fd: FormData): Promise<void> {
  const id = str(fd, "id");
  if (id) await deleteProject(id);
  revalidateAll();
}

export async function saveRoleAction(fd: FormData): Promise<void> {
  const id = str(fd, "id") || `r_${crypto.randomUUID()}`;
  const startRaw = str(fd, "start_year");
  const endRaw = str(fd, "end_year");

  const role: Role = {
    id,
    start_year: Number(startRaw) || new Date().getFullYear(),
    end_year: endRaw === "" ? null : Number(endRaw),
    org: str(fd, "org"),
    role: str(fd, "role"),
    details: str(fd, "details") || null,
  };

  await upsertRole(role);
  revalidateAll();
}

export async function deleteRoleAction(fd: FormData): Promise<void> {
  const id = str(fd, "id");
  if (id) await deleteRole(id);
  revalidateAll();
}
