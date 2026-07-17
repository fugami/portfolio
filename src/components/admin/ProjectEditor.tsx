"use client";

import { useRef, useState, useTransition } from "react";
import type { Project } from "@/lib/types";
import { saveProjectAction } from "@/lib/actions";
import RichTextEditor from "./RichTextEditor";
import { uploadFile } from "./upload";
import { inputClass, labelClass, btnPrimary, btnGhost } from "./ui";

export default function ProjectEditor({
  project,
  onClose,
  onSaved,
}: {
  project: Project | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  const [linkType, setLinkType] = useState<Project["link_type"]>(
    project?.link_type ?? "page"
  );
  const [content, setContent] = useState(project?.content ?? "");
  const [coverImage, setCoverImage] = useState(project?.cover_image ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(formRef.current!);
    startTransition(async () => {
      try {
        await saveProjectAction(fd);
        onSaved();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save");
      }
    });
  }

  async function onCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      setCoverImage(await uploadFile(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-black/40 p-4 sm:p-8">
      <div className="w-full max-w-4xl rounded-xl bg-paper p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-hand text-3xl text-ink-strong">
            {project ? "Edit project" : "New project"}
          </h2>
          <button onClick={onClose} className="text-2xl leading-none text-ink/60 hover:text-ink">
            ×
          </button>
        </div>

        <form ref={formRef} onSubmit={submit} className="space-y-4">
          <input type="hidden" name="id" defaultValue={project?.id ?? ""} />
          <input type="hidden" name="cover_image" value={coverImage} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Date</label>
              <input
                type="date"
                name="date"
                defaultValue={project?.date ?? new Date().toISOString().slice(0, 10)}
                className={inputClass}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Title</label>
              <input name="title" defaultValue={project?.title ?? ""} className={inputClass} required />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Type (medium)</label>
              <input name="type" defaultValue={project?.type ?? ""} className={inputClass} placeholder="YouTube Video" />
            </div>
            <div>
              <label className={labelClass}>Role (your credit)</label>
              <input name="role" defaultValue={project?.role ?? ""} className={inputClass} placeholder="Director" />
            </div>
            <div>
              <label className={labelClass}>Client</label>
              <input name="client" defaultValue={project?.client ?? ""} className={inputClass} placeholder="HF0" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>On click</label>
              <select
                name="link_type"
                value={linkType}
                onChange={(e) => setLinkType(e.target.value as Project["link_type"])}
                className={inputClass}
              >
                <option value="page">Open project page</option>
                <option value="external">Hyperlink out</option>
              </select>
            </div>
            {linkType === "external" ? (
              <div className="sm:col-span-2">
                <label className={labelClass}>External URL</label>
                <input
                  name="external_url"
                  defaultValue={project?.external_url ?? ""}
                  className={inputClass}
                  placeholder="https://youtube.com/watch?v=…"
                />
              </div>
            ) : (
              <div className="sm:col-span-2">
                <label className={labelClass}>Slug (auto from title if blank)</label>
                <input
                  name="slug"
                  defaultValue={project?.slug ?? ""}
                  className={inputClass}
                  placeholder="write-with-blood"
                />
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 text-base text-ink">
              <input type="checkbox" name="featured" defaultChecked={project?.featured ?? false} />
              Featured (asterisk + box)
            </label>
            <label className="flex items-center gap-2 text-base text-ink">
              <input type="checkbox" name="published" defaultChecked={project?.published ?? true} />
              Published
            </label>
          </div>

          {linkType === "page" && (
            <>
              <div>
                <label className={labelClass}>Cover image</label>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className={inputClass + " flex-1"}
                    placeholder="Paste an image URL or upload →"
                  />
                  <label className={btnGhost + " cursor-pointer"}>
                    Upload
                    <input type="file" accept="image/*" className="hidden" onChange={onCoverChange} />
                  </label>
                </div>
                {coverImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverImage} alt="" className="mt-2 max-h-40 rounded border border-ink/15" />
                )}
              </div>

              <div>
                <label className={labelClass}>Page body</label>
                <input type="hidden" name="content" value={content} />
                <RichTextEditor initialContent={content} onChange={setContent} />
                <p className="mt-1.5 text-sm text-ink/50">
                  Write like a doc: ⌘B bold, ⌘I italics, ⌘U underline. Type “- ” for a bullet,
                  “1. ” for a numbered list. Drag images straight into the page.
                </p>
              </div>
            </>
          )}

          {error && <p className="text-base text-red-800">{error}</p>}

          <div className="flex items-center justify-end gap-3 border-t border-ink/15 pt-4">
            {uploading && <span className="text-sm text-ink/60">Uploading…</span>}
            <button type="button" onClick={onClose} className={btnGhost}>
              Cancel
            </button>
            <button type="submit" disabled={pending} className={btnPrimary}>
              {pending ? "Saving…" : "Save project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
