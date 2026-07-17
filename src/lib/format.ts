import type { Role } from "./types";

/** ISO yyyy-mm-dd -> "YY.MM.DD" used throughout the timeline. */
export function formatTimelineDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${y.slice(2)}.${m}.${d}`;
}

/** "2026-" for an open-ended role, otherwise "2023-2026". */
export function formatRolePeriod(role: Role): string {
  return role.end_year == null
    ? `${role.start_year}-`
    : `${role.start_year}-${role.end_year}`;
}

/** Where a project row should navigate. */
export function projectHref(p: {
  link_type: "external" | "page";
  external_url?: string | null;
  slug?: string | null;
}): string | null {
  if (p.link_type === "external") return p.external_url || null;
  if (p.link_type === "page" && p.slug) return `/projects/${p.slug}`;
  return null;
}
