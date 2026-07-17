"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Project, Role } from "@/lib/types";
import { formatTimelineDate, formatRolePeriod } from "@/lib/format";
import { deleteProjectAction, deleteRoleAction } from "@/lib/actions";
import ProjectEditor from "./ProjectEditor";
import RoleEditor from "./RoleEditor";
import { btnGhost, btnPrimary, btnDanger, cardClass } from "./ui";

type Section = "projects" | "roles";

export default function AdminDashboard({
  projects,
  roles,
  readOnly = false,
}: {
  projects: Project[];
  roles: Role[];
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [section, setSection] = useState<Section>("projects");
  const [editingProject, setEditingProject] = useState<Project | null | undefined>(
    undefined
  ); // undefined = not editing, null = new
  const [editingRole, setEditingRole] = useState<Role | null | undefined>(undefined);
  const [pending, startTransition] = useTransition();

  function refresh() {
    startTransition(() => router.refresh());
  }

  function removeProject(id: string) {
    if (!confirm("Delete this project?")) return;
    const fd = new FormData();
    fd.set("id", id);
    startTransition(async () => {
      await deleteProjectAction(fd);
      router.refresh();
    });
  }

  function removeRole(id: string) {
    if (!confirm("Delete this role?")) return;
    const fd = new FormData();
    fd.set("id", id);
    startTransition(async () => {
      await deleteRoleAction(fd);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-6 flex gap-2">
        <SectionTab active={section === "projects"} onClick={() => setSection("projects")}>
          Projects
        </SectionTab>
        <SectionTab active={section === "roles"} onClick={() => setSection("roles")}>
          Roles
        </SectionTab>
      </div>

      {section === "projects" ? (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              className={btnPrimary}
              disabled={readOnly}
              onClick={() => setEditingProject(null)}
            >
              + New project
            </button>
          </div>

          {projects.map((p) => (
            <div key={p.id} className={`${cardClass} flex items-center gap-4`}>
              <span className="w-20 shrink-0 font-mono text-xs text-ink/60">
                {formatTimelineDate(p.date)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium text-ink-strong">{p.title}</span>
                  {p.featured && (
                    <span className="rounded bg-ink/10 px-1.5 py-0.5 text-[10px] uppercase text-ink/70">
                      featured
                    </span>
                  )}
                  {!p.published && (
                    <span className="rounded bg-black/10 px-1.5 py-0.5 text-[10px] uppercase text-ink/60">
                      draft
                    </span>
                  )}
                </div>
                <div className="truncate text-sm text-ink/60">
                  {p.type} // {p.role} // {p.client} ·{" "}
                  {p.link_type === "external" ? `↗ ${p.external_url ?? "—"}` : `/projects/${p.slug ?? "—"}`}
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button className={btnGhost} disabled={readOnly} onClick={() => setEditingProject(p)}>
                  Edit
                </button>
                <button className={btnDanger} disabled={readOnly} onClick={() => removeProject(p.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}

          {projects.length === 0 && (
            <p className="text-base text-ink/60">No projects yet — add one.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              className={btnPrimary}
              disabled={readOnly}
              onClick={() => setEditingRole(null)}
            >
              + New role
            </button>
          </div>

          {roles.map((r) => (
            <div key={r.id} className={`${cardClass} flex items-center gap-4`}>
              <span className="w-24 shrink-0 font-mono text-xs text-ink/60">
                {formatRolePeriod(r)}
              </span>
              <div className="min-w-0 flex-1">
                <span className="font-medium text-ink-strong">{r.org}</span>
                <div className="truncate text-sm text-ink/60">{r.role}</div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button className={btnGhost} disabled={readOnly} onClick={() => setEditingRole(r)}>
                  Edit
                </button>
                <button className={btnDanger} disabled={readOnly} onClick={() => removeRole(r.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}

          {roles.length === 0 && <p className="text-base text-ink/60">No roles yet — add one.</p>}
        </div>
      )}

      {editingProject !== undefined && (
        <ProjectEditor
          project={editingProject}
          onClose={() => setEditingProject(undefined)}
          onSaved={() => {
            setEditingProject(undefined);
            refresh();
          }}
        />
      )}

      {editingRole !== undefined && (
        <RoleEditor
          role={editingRole}
          onClose={() => setEditingRole(undefined)}
          onSaved={() => {
            setEditingRole(undefined);
            refresh();
          }}
        />
      )}

      {pending && (
        <div className="pointer-events-none fixed bottom-4 right-4 rounded-md bg-ink-strong px-3 py-1.5 text-xs text-paper">
          Saving…
        </div>
      )}
    </div>
  );
}

function SectionTab({
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
      onClick={onClick}
      className={`rounded-md px-4 py-2 text-base font-medium transition ${
        active ? "bg-ink-strong text-paper" : "border border-ink/25 text-ink hover:bg-black/5"
      }`}
    >
      {children}
    </button>
  );
}
