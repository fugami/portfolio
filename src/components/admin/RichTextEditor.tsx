"use client";

import { useCallback, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import { marked } from "marked";
import Video from "./VideoNode";
import { uploadFile } from "./upload";

/** Bodies saved before this editor existed are Markdown; the editor speaks
 *  HTML. Convert those once, when the document is opened. */
function toEditorHtml(content: string): string {
  if (!content.trim() || /^\s*</.test(content)) return content;
  return marked.parse(content, { async: false }) as string;
}

function mediaFiles(data: DataTransfer | null): File[] {
  return Array.from(data?.files ?? []).filter(
    (f) => f.type.startsWith("image/") || f.type.startsWith("video/")
  );
}

export default function RichTextEditor({
  initialContent,
  onChange,
}: {
  initialContent: string;
  onChange: (html: string) => void;
}) {
  const editorRef = useRef<Editor | null>(null);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /** Upload dropped/pasted/picked images & videos, then insert them where they
   *  landed (pos) or at the caret (null). */
  const insertMedia = useCallback((files: File[], pos: number | null) => {
    for (const file of files) {
      setError(null);
      setUploading((n) => n + 1);
      uploadFile(file)
        .then((url) => {
          const ed = editorRef.current;
          if (!ed || ed.isDestroyed) return;
          const node = file.type.startsWith("video/")
            ? { type: "video", attrs: { src: url } }
            : { type: "image", attrs: { src: url, alt: file.name } };
          if (pos != null) {
            ed.chain()
              .insertContentAt(Math.min(pos, ed.state.doc.content.size), node)
              .run();
          } else {
            ed.chain().focus().insertContent(node).run();
          }
        })
        .catch((err) => setError(err instanceof Error ? err.message : "Upload failed"))
        .finally(() => setUploading((n) => n - 1));
    }
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        // Keep it doc-like: stray backticks shouldn't turn into code blocks.
        code: false,
        codeBlock: false,
      }),
      Underline,
      Image,
      Video,
      Link.configure({ openOnClick: false }),
      Youtube.configure({
        nocookie: true,
        HTMLAttributes: { class: "yt-embed" },
      }),
      Placeholder.configure({
        placeholder: "Write the page here — it will look just like it does on the site.",
      }),
    ],
    content: toEditorHtml(initialContent),
    editorProps: {
      attributes: {
        class:
          "prose-garamond mx-auto w-full max-w-2xl min-h-[22rem] px-4 py-6 focus:outline-none",
      },
      handleDrop: (view, event, _slice, moved) => {
        if (moved) return false;
        const files = mediaFiles(event.dataTransfer);
        if (files.length === 0) return false;
        event.preventDefault();
        const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
        insertMedia(files, coords?.pos ?? null);
        return true;
      },
      handlePaste: (_view, event) => {
        const files = mediaFiles(event.clipboardData);
        if (files.length === 0) return false;
        event.preventDefault();
        insertMedia(files, null);
        return true;
      },
    },
    // Normalize legacy Markdown to HTML as soon as the doc opens, so a plain
    // "Save" also migrates the stored body.
    onCreate: ({ editor }) => {
      onChange(editor.isEmpty ? "" : editor.getHTML());
    },
    onUpdate: ({ editor }) => {
      onChange(editor.isEmpty ? "" : editor.getHTML());
    },
  });
  editorRef.current = editor;

  function pickMedia(e: React.ChangeEvent<HTMLInputElement>) {
    insertMedia(Array.from(e.target.files ?? []), null);
    e.target.value = "";
  }

  function editLink() {
    if (!editor) return;
    const prev = (editor.getAttributes("link").href as string | undefined) ?? "";
    const url = window.prompt("Link URL (leave empty to remove the link)", prev || "https://");
    if (url === null) return;
    const chain = editor.chain().focus().extendMarkRange("link");
    if (url.trim() === "" || url.trim() === "https://") chain.unsetLink().run();
    else chain.setLink({ href: url.trim() }).run();
  }

  const block = !editor
    ? "p"
    : editor.isActive("heading", { level: 2 })
      ? "h2"
      : editor.isActive("heading", { level: 3 })
        ? "h3"
        : "p";

  return (
    <div className="rounded-md border border-ink/25 bg-white/40 focus-within:border-ink/60">
      {/* Toolbar — sticks to the top while the page scrolls, like a doc. */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 rounded-t-md border-b border-ink/15 bg-paper px-2 py-1.5">
        <ToolbarButton
          title="Undo (⌘Z)"
          disabled={!editor?.can().undo()}
          onClick={() => editor?.chain().focus().undo().run()}
        >
          ↩
        </ToolbarButton>
        <ToolbarButton
          title="Redo (⇧⌘Z)"
          disabled={!editor?.can().redo()}
          onClick={() => editor?.chain().focus().redo().run()}
        >
          ↪
        </ToolbarButton>

        <Divider />

        <select
          value={block}
          title="Paragraph style"
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => {
            const v = e.target.value;
            const chain = editor?.chain().focus();
            if (!chain) return;
            if (v === "h2") chain.setHeading({ level: 2 }).run();
            else if (v === "h3") chain.setHeading({ level: 3 }).run();
            else chain.setParagraph().run();
          }}
          className="rounded border border-ink/25 bg-white/60 px-2 py-1 text-sm text-ink outline-none"
        >
          <option value="p">Body text</option>
          <option value="h2">Section heading</option>
          <option value="h3">Subheading</option>
        </select>

        <Divider />

        <ToolbarButton
          title="Bold (⌘B)"
          active={editor?.isActive("bold")}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <span className="font-bold">B</span>
        </ToolbarButton>
        <ToolbarButton
          title="Italic (⌘I)"
          active={editor?.isActive("italic")}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <span className="italic">I</span>
        </ToolbarButton>
        <ToolbarButton
          title="Underline (⌘U)"
          active={editor?.isActive("underline")}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        >
          <span className="underline">U</span>
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          title="Bulleted list"
          active={editor?.isActive("bulletList")}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <BulletListIcon />
        </ToolbarButton>
        <ToolbarButton
          title="Numbered list"
          active={editor?.isActive("orderedList")}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <OrderedListIcon />
        </ToolbarButton>
        <ToolbarButton
          title="Quote"
          active={editor?.isActive("blockquote")}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        >
          ❝
        </ToolbarButton>

        <Divider />

        <ToolbarButton title="Add or edit link" active={editor?.isActive("link")} onClick={editLink}>
          Link
        </ToolbarButton>
        <label
          title="Insert an image or video (or just drag files in)"
          className="cursor-pointer rounded px-2 py-1 text-sm leading-none text-ink transition hover:bg-black/10"
          onMouseDown={(e) => e.preventDefault()}
        >
          + Media
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={pickMedia}
          />
        </label>

        <span className="ml-auto pl-2 text-xs text-ink/60">
          {uploading > 0 ? "Uploading…" : error ?? ""}
        </span>
      </div>

      {/* The document itself, styled exactly like the live project page. */}
      <div className="cursor-text" onClick={() => editor?.chain().focus().run()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      // Don't steal focus/selection from the editor when clicking the toolbar.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`min-w-[1.9rem] rounded px-2 py-1 text-sm leading-none transition disabled:opacity-30 ${
        active ? "bg-ink-strong text-paper" : "text-ink hover:bg-black/10"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-ink/20" aria-hidden />;
}

function BulletListIcon() {
  return (
    <svg viewBox="0 0 16 16" className="inline h-4 w-4" fill="currentColor" aria-hidden>
      <circle cx="2" cy="3" r="1.3" />
      <circle cx="2" cy="8" r="1.3" />
      <circle cx="2" cy="13" r="1.3" />
      <rect x="5.5" y="2.25" width="10" height="1.5" rx="0.75" />
      <rect x="5.5" y="7.25" width="10" height="1.5" rx="0.75" />
      <rect x="5.5" y="12.25" width="10" height="1.5" rx="0.75" />
    </svg>
  );
}

function OrderedListIcon() {
  return (
    <svg viewBox="0 0 16 16" className="inline h-4 w-4" fill="currentColor" aria-hidden>
      <text x="0" y="5" fontSize="5.5" fontFamily="serif">1</text>
      <text x="0" y="10" fontSize="5.5" fontFamily="serif">2</text>
      <text x="0" y="15" fontSize="5.5" fontFamily="serif">3</text>
      <rect x="5.5" y="2.25" width="10" height="1.5" rx="0.75" />
      <rect x="5.5" y="7.25" width="10" height="1.5" rx="0.75" />
      <rect x="5.5" y="12.25" width="10" height="1.5" rx="0.75" />
    </svg>
  );
}
