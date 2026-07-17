"use client";

import { useRef, useState, useTransition } from "react";
import type { Role } from "@/lib/types";
import { saveRoleAction } from "@/lib/actions";
import Markdown from "@/components/Markdown";
import { inputClass, labelClass, btnPrimary, btnGhost } from "./ui";

export default function RoleEditor({
  role,
  onClose,
  onSaved,
}: {
  role: Role | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [details, setDetails] = useState(role?.details ?? "");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(formRef.current!);
    startTransition(async () => {
      try {
        await saveRoleAction(fd);
        onSaved();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-black/40 p-4 sm:p-8">
      <div className="w-full max-w-2xl rounded-xl bg-paper p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-hand text-3xl text-ink-strong">
            {role ? "Edit role" : "New role"}
          </h2>
          <button onClick={onClose} className="text-2xl leading-none text-ink/60 hover:text-ink">
            ×
          </button>
        </div>

        <form ref={formRef} onSubmit={submit} className="space-y-4">
          <input type="hidden" name="id" defaultValue={role?.id ?? ""} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Start year</label>
              <input
                type="number"
                name="start_year"
                defaultValue={role?.start_year ?? new Date().getFullYear()}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>End year (blank = present)</label>
              <input
                type="number"
                name="end_year"
                defaultValue={role?.end_year ?? ""}
                className={inputClass}
                placeholder="present"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Organization (center)</label>
            <input name="org" defaultValue={role?.org ?? ""} className={inputClass} placeholder="HF0" required />
          </div>

          <div>
            <label className={labelClass}>Role (right)</label>
            <input name="role" defaultValue={role?.role ?? ""} className={inputClass} placeholder="Founding Team, Creative Director" />
          </div>

          <div>
            <label className={labelClass}>Expanded details (Markdown — use “- ” for bullets)</label>
            <div className="grid gap-4 lg:grid-cols-2">
              <textarea
                name="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={8}
                className={inputClass + " font-mono text-xs leading-relaxed"}
                placeholder={"- Most selective startup program in the world.\n- Early investors in:\n  - OpenRouter, Krea, Doctronic, Fyxer, etc."}
              />
              <div className="rounded-md border border-ink/15 bg-paper p-3">
                <div className="role-details text-ink">
                  <Markdown>{details || "_Optional. Shown when the row is expanded._"}</Markdown>
                </div>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-800">{error}</p>}

          <div className="flex items-center justify-end gap-3 border-t border-ink/15 pt-4">
            <button type="button" onClick={onClose} className={btnGhost}>
              Cancel
            </button>
            <button type="submit" disabled={pending} className={btnPrimary}>
              {pending ? "Saving…" : "Save role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
