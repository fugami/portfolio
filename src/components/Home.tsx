"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Project, Role } from "@/lib/types";
import { formatTimelineDate, formatRolePeriod, projectHref } from "@/lib/format";
import Globe from "./Globe";
import FeaturedFrame from "./FeaturedFrame";
import InkRule from "./InkRule";
import TabUnderline from "./TabUnderline";
import Markdown from "./Markdown";

type Tab = "projects" | "roles";

/** Distinct facet values, most frequent first (ties alphabetical). */
function facetValues(values: string[]): string[] {
  const counts = new Map<string, number>();
  for (const raw of values) {
    const v = raw.trim();
    if (!v) continue;
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([v]) => v);
}

export default function Home({
  projects,
  roles,
}: {
  projects: Project[];
  roles: Role[];
}) {
  const [tab, setTab] = useState<Tab>("projects");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);

  const typeOptions = useMemo(() => facetValues(projects.map((p) => p.type)), [projects]);
  const roleOptions = useMemo(() => facetValues(projects.map((p) => p.role)), [projects]);

  function toggleFeatured() {
    setFeaturedOnly((on) => {
      if (!on) setTab("projects"); // turning the filter on jumps to the project list
      return !on;
    });
  }

  function clearFilters() {
    setTypeFilter(null);
    setRoleFilter(null);
    setFeaturedOnly(false);
  }

  const isHidden = (p: Project) =>
    (featuredOnly && !p.featured) ||
    (typeFilter !== null && p.type !== typeFilter) ||
    (roleFilter !== null && p.role !== roleFilter);

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="flex items-start justify-between px-8 pt-8 sm:px-12">
        <div className="relative">
          <button
            type="button"
            onClick={toggleFeatured}
            aria-pressed={featuredOnly}
            title={featuredOnly ? "Show all projects" : "Show featured only"}
            className={`absolute -left-3 -top-7 font-garamond text-5xl leading-none text-ink transition-transform duration-300 ease-out hover:scale-110 sm:text-6xl ${
              featuredOnly ? "rotate-[-72deg] scale-110" : ""
            }`}
          >
            *
          </button>
          <div className="font-hand leading-[0.9] text-ink-strong">
            <span className="block text-3xl sm:text-4xl">Jordan Mitchell</span>
            <span className="block pl-7 text-xl text-ink/80 sm:text-2xl">Creative Timeline</span>
          </div>
        </div>

        <Link href="/world" className="group shrink-0" aria-label="World">
          <Globe className="h-16 w-16 text-ink-strong sm:h-20 sm:w-20" />
        </Link>
      </header>

      {/* Tabs + content */}
      <section className="mx-auto w-full max-w-3xl px-6 pb-28 pt-10 sm:pt-16">
        <h1 className="mb-6 text-center font-garamond text-5xl tracking-wide text-ink-strong [font-variant:small-caps] sm:mb-8 sm:text-6xl">
          <TabButton active={tab === "projects"} onClick={() => setTab("projects")}>
            Projects
          </TabButton>
          <span className="mx-2 font-normal text-ink/70"> // </span>
          <TabButton active={tab === "roles"} onClick={() => setTab("roles")}>
            Roles
          </TabButton>
        </h1>

        {/* Quiet filter line, only for the project list. */}
        {tab === "projects" && (
          <div className="mb-10 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 text-center font-garamond text-xl sm:mb-14 sm:text-2xl">
            <FilterMenu
              allLabel="all types"
              value={typeFilter}
              options={typeOptions}
              onChange={setTypeFilter}
            />
            <span className="text-ink/40">//</span>
            <FilterMenu
              allLabel="all roles"
              value={roleFilter}
              options={roleOptions}
              onChange={setRoleFilter}
            />
            {(typeFilter !== null || roleFilter !== null) && (
              <button
                type="button"
                onClick={clearFilters}
                className="ml-2 text-base text-ink/50 underline-offset-4 transition hover:text-ink hover:underline"
              >
                clear
              </button>
            )}
          </div>
        )}

        {tab === "projects" ? (
          <ProjectsList projects={projects} isHidden={isHidden} onClear={clearFilters} />
        ) : (
          <RolesList roles={roles} />
        )}
      </section>
    </main>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative inline-block ${active ? "font-bold text-ink-strong" : "font-normal text-ink/55"}`}
    >
      {children}
      {active && (
        <TabUnderline className="absolute -bottom-1 left-0 h-3 w-full text-ink-strong" />
      )}
    </button>
  );
}

/* ------------------------------- Filtering ------------------------------- */

function FilterMenu({
  allLabel,
  value,
  options,
  onChange,
}: {
  allLabel: string;
  value: string | null;
  options: string[];
  onChange: (v: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close when clicking anywhere outside the menu.
  useEffect(() => {
    if (!open) return;
    function onDocDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [open]);

  function pick(v: string | null) {
    onChange(v);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`transition-colors ${
          value !== null ? "text-ink-strong" : "text-ink/60 hover:text-ink"
        }`}
      >
        {(value ?? allLabel).toLowerCase()}
        <span
          className={`ml-1 inline-block text-sm text-ink/40 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        >
          ⌄
        </span>
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-20 mt-1 max-h-80 w-max min-w-[10rem] -translate-x-1/2 overflow-y-auto rounded-md border border-ink/25 bg-paper py-1 text-left shadow-xl">
          <MenuItem active={value === null} onClick={() => pick(null)}>
            {allLabel}
          </MenuItem>
          {options.map((o) => (
            <MenuItem key={o} active={value === o} onClick={() => pick(o)}>
              {o.toLowerCase()}
            </MenuItem>
          ))}
        </div>
      )}
    </div>
  );
}

function MenuItem({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full whitespace-nowrap px-4 py-0.5 text-left text-xl leading-snug transition hover:bg-black/5 ${
        active ? "text-ink-strong" : "text-ink/75"
      }`}
    >
      {active && <span className="mr-1.5">*</span>}
      {children}
    </button>
  );
}

/* ------------------------------- Projects -------------------------------- */

function ProjectsList({
  projects,
  isHidden,
  onClear,
}: {
  projects: Project[];
  isHidden: (p: Project) => boolean;
  onClear: () => void;
}) {
  if (projects.length === 0) {
    return <p className="text-center font-garamond text-2xl text-ink/60">No projects yet.</p>;
  }
  const allHidden = projects.every(isHidden);
  return (
    <>
      <ul className="flex flex-col">
        {projects.map((p) => (
          <ProjectRow key={p.id} project={p} hidden={isHidden(p)} />
        ))}
      </ul>
      {allHidden && (
        <p className="text-center font-garamond text-2xl text-ink/60">
          nothing here —{" "}
          <button
            type="button"
            onClick={onClear}
            className="underline underline-offset-4 transition hover:text-ink"
          >
            clear filters
          </button>
        </p>
      )}
    </>
  );
}

function ProjectRow({ project, hidden }: { project: Project; hidden: boolean }) {
  const href = projectHref(project);
  const external = project.link_type === "external";

  const inner = (
    <div className="grid grid-cols-[4.6rem_1fr_auto] items-baseline gap-x-4 sm:grid-cols-[6rem_1fr_auto] sm:gap-x-6">
      <span className="font-garamond text-xl text-ink sm:text-2xl">
        {formatTimelineDate(project.date)}
      </span>
      <span
        className={`font-garamond text-2xl leading-tight tracking-wide text-ink-strong [font-variant:small-caps] sm:text-3xl ${
          project.featured ? "font-bold" : "font-normal"
        }`}
      >
        {project.title}
      </span>
      <span className="whitespace-nowrap font-garamond text-sm tracking-wide text-ink-faded [font-variant:small-caps] sm:text-base">
        {project.type} // {project.client}
      </span>
    </div>
  );

  return (
    <li className="relative">
      {project.featured && (
        <>
          <span
            className={`absolute -left-7 top-1/2 hidden -translate-y-1/2 font-garamond text-3xl leading-none text-ink transition-opacity duration-500 sm:block ${
              hidden ? "opacity-0" : "opacity-100"
            }`}
          >
            *
          </span>
          <FeaturedFrame
            className={`pointer-events-none absolute -inset-x-3 -inset-y-1 h-[calc(100%+0.5rem)] w-[calc(100%+1.5rem)] text-ink transition-opacity duration-500 ${
              hidden ? "opacity-0" : "opacity-100"
            }`}
          />
        </>
      )}

      {/* Collapsible wrapper drives the filter show/hide animation. */}
      <div
        className={`grid transition-all duration-500 ease-out ${hidden ? "pointer-events-none" : ""}`}
        style={{ gridTemplateRows: hidden ? "0fr" : "1fr", opacity: hidden ? 0 : 1 }}
        aria-hidden={hidden}
      >
        <div className="overflow-hidden">
          {href ? (
            external ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="relative block px-3 py-2"
                tabIndex={hidden ? -1 : undefined}
              >
                {inner}
              </a>
            ) : (
              <Link
                href={href}
                className="relative block px-3 py-2"
                tabIndex={hidden ? -1 : undefined}
              >
                {inner}
              </Link>
            )
          ) : (
            <div className="relative px-3 py-2">{inner}</div>
          )}
        </div>
      </div>
    </li>
  );
}

/* -------------------------------- Roles ---------------------------------- */

function RolesList({ roles }: { roles: Role[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (roles.length === 0) {
    return <p className="text-center font-garamond text-2xl text-ink/60">No roles yet.</p>;
  }

  return (
    <ul className="flex flex-col">
      {roles.map((role) => {
        const open = openId === role.id;
        const hasDetails = Boolean(role.details && role.details.trim());
        return (
          <li key={role.id} className="relative py-3">
            <InkRule
              open={open}
              className={`pointer-events-none absolute inset-x-0 top-0 h-3 text-ink-strong transition-opacity duration-300 ${
                open ? "opacity-100" : "opacity-0"
              }`}
            />

            <button
              type="button"
              disabled={!hasDetails}
              onClick={() => setOpenId(open ? null : role.id)}
              className={`grid w-full grid-cols-[8.5rem_1fr] items-baseline gap-x-3 text-left sm:grid-cols-[11rem_1fr] sm:gap-x-5 ${
                hasDetails ? "cursor-pointer" : "cursor-default"
              }`}
              aria-expanded={open}
            >
              <span className="whitespace-nowrap font-garamond text-2xl text-ink sm:text-3xl">
                {formatRolePeriod(role)}
              </span>
              <span className="flex flex-wrap items-baseline gap-x-3">
                <span className="font-garamond text-3xl font-bold leading-tight tracking-wide text-ink-strong [font-variant:small-caps] sm:text-4xl">
                  {role.org}
                </span>
                <span className="font-garamond text-base tracking-wide text-ink-faded [font-variant:small-caps] sm:text-lg">
                  {role.role}
                </span>
              </span>
            </button>

            <div
              className="grid transition-[grid-template-rows] duration-500 ease-out"
              style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                {hasDetails && (
                  <div
                    className={`role-details pl-8 pr-2 pt-3 text-ink sm:pl-[12rem] ${
                      open ? "ink-reveal" : ""
                    }`}
                  >
                    <Markdown>{role.details!}</Markdown>
                  </div>
                )}
              </div>
            </div>

            <InkRule
              open={open}
              className={`pointer-events-none absolute inset-x-0 bottom-0 h-3 text-ink-strong transition-opacity duration-300 ${
                open ? "opacity-100" : "opacity-0"
              }`}
            />
          </li>
        );
      })}
    </ul>
  );
}
