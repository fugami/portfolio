// Shared data model. These shapes map 1:1 to the Supabase tables defined in
// supabase/schema.sql, and to the local data/store.json fallback used until
// Supabase is configured.

export type LinkType = "external" | "page";

export type Project = {
  id: string;
  /** ISO date (yyyy-mm-dd). Rendered as YY.MM.DD in the timeline. */
  date: string;
  title: string;
  /** The medium, e.g. "Film", "YouTube Video", "Fashion Collection". Shown left of the "//". */
  type: string;
  /** Jordan's credit on the project, e.g. "Director", "Editor", "Creative Director". */
  role: string;
  /** Right of the "//" in the meta column, e.g. "HF0". */
  client: string;
  /** Featured rows get the asterisk + hand-drawn box. */
  featured: boolean;
  /** "external" hyperlinks out; "page" opens /projects/[slug]. */
  link_type: LinkType;
  external_url?: string | null;
  /** Required when link_type === "page". */
  slug?: string | null;
  /** Cover image URL for the project page. */
  cover_image?: string | null;
  /** Freeform Markdown body for the project page. */
  content?: string | null;
  /** Hidden from the public site when false. */
  published: boolean;
};

export type Role = {
  id: string;
  start_year: number;
  /** null => "present" (renders as "2026-"). */
  end_year: number | null;
  /** Center column, e.g. "HF0". */
  org: string;
  /** Right column, e.g. "Founding Team, Creative Director". */
  role: string;
  /** Markdown shown when the row is expanded. */
  details?: string | null;
};

export type Store = {
  projects: Project[];
  roles: Role[];
};
