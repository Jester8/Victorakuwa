"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extensions";
import {
  Bold,
  ExternalLink,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
  X,
} from "lucide-react";
import { savePostAction, type ActionState } from "@/app/admin/actions";
import { slugify } from "@/lib/slug";

export type EditablePost = {
  id?: number;
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string | null;
  contentHtml: string;
  status: "draft" | "published";
};

async function uploadImage(file: File) {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !data.url) throw new Error(data.error || "Upload failed.");
  return data.url;
}

function ToolbarButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex size-9 items-center justify-center rounded-lg transition-colors disabled:opacity-30 ${
        active ? "bg-foreground text-background" : "text-foreground/75 hover:bg-foreground/5 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor, onImage, uploading }: { editor: Editor; onImage: () => void; uploading: boolean }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      paragraph: e.isActive("paragraph"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      link: e.isActive("link"),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link address (leave empty to remove)", previous ?? "https://");
    if (url === null) return;
    if (!url.trim() || url.trim() === "https://") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const href = /^(https?:|mailto:)/.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
  };

  const divider = <span className="mx-1 h-6 w-px bg-line" aria-hidden="true" />;
  const c = () => editor.chain().focus();

  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-line bg-background/95 px-2 py-1.5 backdrop-blur"
    >
      <ToolbarButton label="Paragraph" active={state.paragraph} onClick={() => c().setParagraph().run()}>
        <Pilcrow size={17} />
      </ToolbarButton>
      <ToolbarButton label="Heading" active={state.h2} onClick={() => c().toggleHeading({ level: 2 }).run()}>
        <Heading2 size={18} />
      </ToolbarButton>
      <ToolbarButton label="Subheading" active={state.h3} onClick={() => c().toggleHeading({ level: 3 }).run()}>
        <Heading3 size={18} />
      </ToolbarButton>
      {divider}
      <ToolbarButton label="Bold" active={state.bold} onClick={() => c().toggleBold().run()}>
        <Bold size={17} />
      </ToolbarButton>
      <ToolbarButton label="Italic" active={state.italic} onClick={() => c().toggleItalic().run()}>
        <Italic size={17} />
      </ToolbarButton>
      <ToolbarButton label="Underline" active={state.underline} onClick={() => c().toggleUnderline().run()}>
        <Underline size={17} />
      </ToolbarButton>
      <ToolbarButton label="Strikethrough" active={state.strike} onClick={() => c().toggleStrike().run()}>
        <Strikethrough size={17} />
      </ToolbarButton>
      <ToolbarButton label="Link" active={state.link} onClick={setLink}>
        <Link2 size={17} />
      </ToolbarButton>
      {divider}
      <ToolbarButton label="Bulleted list" active={state.bullet} onClick={() => c().toggleBulletList().run()}>
        <List size={18} />
      </ToolbarButton>
      <ToolbarButton label="Numbered list" active={state.ordered} onClick={() => c().toggleOrderedList().run()}>
        <ListOrdered size={18} />
      </ToolbarButton>
      <ToolbarButton label="Quote" active={state.quote} onClick={() => c().toggleBlockquote().run()}>
        <Quote size={17} />
      </ToolbarButton>
      <ToolbarButton label="Divider" onClick={() => c().setHorizontalRule().run()}>
        <Minus size={18} />
      </ToolbarButton>
      <ToolbarButton label="Insert image" disabled={uploading} onClick={onImage}>
        {uploading ? <Loader2 size={17} className="animate-spin" /> : <ImagePlus size={18} />}
      </ToolbarButton>
      {divider}
      <ToolbarButton label="Undo" disabled={!state.canUndo} onClick={() => c().undo().run()}>
        <Undo2 size={17} />
      </ToolbarButton>
      <ToolbarButton label="Redo" disabled={!state.canRedo} onClick={() => c().redo().run()}>
        <Redo2 size={17} />
      </ToolbarButton>
    </div>
  );
}

export default function PostEditor({ post, justSaved }: { post: EditablePost; justSaved?: boolean }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(savePostAction, {});
  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(post.id));
  const [excerpt, setExcerpt] = useState(post.excerpt);
  const [coverUrl, setCoverUrl] = useState(post.coverUrl ?? "");
  const [contentHtml, setContentHtml] = useState(post.contentHtml);
  const [status, setStatus] = useState(post.status);
  const [uploading, setUploading] = useState<"cover" | "inline" | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [showSaved, setShowSaved] = useState(Boolean(justSaved));
  const inlineInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);
  const intent = useRef<"draft" | "published">(post.status);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      Image,
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    content: post.contentHtml,
    editorProps: {
      attributes: { class: "blog-prose min-h-[24rem] px-5 py-6 outline-none sm:px-8" },
    },
    onUpdate: ({ editor: e }) => {
      setContentHtml(e.getHTML());
      setDirty(true);
    },
  });

  // A successful save (or creating the post) clears the unsaved marker.
  useEffect(() => {
    if (!state.savedAt) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDirty(false);
    setStatus(intent.current);
    setShowSaved(true);
  }, [state.savedAt]);

  useEffect(() => {
    if (!showSaved) return;
    const timer = setTimeout(() => setShowSaved(false), 2500);
    return () => clearTimeout(timer);
  }, [showSaved]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const pickInlineImage = async (file: File | undefined) => {
    if (!file || !editor) return;
    setUploading("inline");
    setUploadError("");
    try {
      const url = await uploadImage(file);
      editor.chain().focus().setImage({ src: url, alt: "" }).run();
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(null);
    }
  };

  const pickCover = async (file: File | undefined) => {
    if (!file) return;
    setUploading("cover");
    setUploadError("");
    try {
      setCoverUrl(await uploadImage(file));
      setDirty(true);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(null);
    }
  };

  const markDirty = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setDirty(true);
  };

  const isLive = status === "published";

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
        intent.current = submitter?.value === "published" ? "published" : "draft";
      }}
      className="mx-auto max-w-4xl"
    >
      <input type="hidden" name="id" value={post.id ?? ""} />
      <input type="hidden" name="coverUrl" value={coverUrl} />
      <input type="hidden" name="contentHtml" value={contentHtml} />

      <div className="sticky top-0 z-20 -mx-5 -mt-8 mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-neutral-50/95 px-5 py-3 backdrop-blur md:-mx-10 md:-mt-10 md:px-10">
        <div className="flex items-center gap-3 text-sm">
          <Link href="/admin/posts" className="text-muted hover:text-foreground">
            Posts
          </Link>
          <span className="text-line">/</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
              isLive ? "bg-foreground text-background" : "border border-line text-muted"
            }`}
          >
            {isLive ? "Live" : "Draft"}
          </span>
          <span className="text-muted" aria-live="polite">
            {pending ? "Saving…" : showSaved ? "Saved" : dirty ? "Unsaved changes" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isLive && post.id && (
            <Link
              href={`/blog/${slug}`}
              target="_blank"
              className="hidden h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted hover:text-foreground sm:inline-flex"
            >
              View <ExternalLink size={14} />
            </Link>
          )}
          <button
            type="submit"
            name="status"
            value="draft"
            disabled={pending || uploading !== null}
            className="h-10 rounded-full border border-line bg-background px-4 text-sm font-semibold transition-colors hover:border-foreground disabled:opacity-50"
          >
            {isLive ? "Unpublish" : "Save draft"}
          </button>
          <button
            type="submit"
            name="status"
            value="published"
            disabled={pending || uploading !== null}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {pending && <Loader2 size={15} className="animate-spin" />}
            {isLive ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      {(state.error || uploadError) && (
        <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error || uploadError}
        </p>
      )}

      <div className="space-y-5">
        <div className="rounded-2xl border border-line bg-background p-5 sm:p-6">
          {coverUrl ? (
            <div className="relative overflow-hidden rounded-xl bg-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverUrl} alt="Cover" className="aspect-[16/9] w-full object-cover" />
              <div className="absolute right-3 top-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => coverInput.current?.click()}
                  className="h-9 rounded-full bg-background/90 px-4 text-sm font-semibold backdrop-blur"
                >
                  Change
                </button>
                <button
                  type="button"
                  aria-label="Remove cover image"
                  onClick={() => markDirty(setCoverUrl)("")}
                  className="flex size-9 items-center justify-center rounded-full bg-background/90 backdrop-blur"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => coverInput.current?.click()}
              disabled={uploading === "cover"}
              className="flex aspect-[16/6] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line text-sm text-muted transition-colors hover:border-foreground hover:text-foreground"
            >
              {uploading === "cover" ? <Loader2 size={20} className="animate-spin" /> : <ImagePlus size={22} />}
              {uploading === "cover" ? "Uploading…" : "Add a cover image"}
            </button>
          )}
          <input
            ref={coverInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            className="hidden"
            onChange={(e) => {
              void pickCover(e.target.files?.[0]);
              e.target.value = "";
            }}
          />

          <label className="mt-6 block">
            <span className="sr-only">Title</span>
            <textarea
              name="title"
              value={title}
              rows={1}
              onChange={(e) => {
                markDirty(setTitle)(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              placeholder="Post title"
              className="field-sizing-content w-full resize-none bg-transparent text-3xl font-semibold leading-tight tracking-tight outline-none placeholder:text-foreground/25 sm:text-4xl"
            />
          </label>
          <label className="mt-3 block">
            <span className="sr-only">Summary</span>
            <textarea
              name="excerpt"
              value={excerpt}
              maxLength={300}
              rows={2}
              onChange={(e) => markDirty(setExcerpt)(e.target.value)}
              placeholder="A one or two sentence summary, shown on the blog page and when shared"
              className="field-sizing-content w-full resize-none bg-transparent text-lg leading-relaxed text-muted outline-none placeholder:text-foreground/25"
            />
          </label>
          <label className="mt-3 flex items-center gap-1 border-t border-line pt-4 text-sm text-muted">
            <span className="shrink-0">/blog/</span>
            <input
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                markDirty(setSlug)(slugify(e.target.value) + (e.target.value.endsWith("-") ? "-" : ""));
              }}
              placeholder="post-url"
              aria-label="URL slug"
              className="min-w-0 flex-1 bg-transparent font-medium text-foreground outline-none"
            />
          </label>
        </div>

        <div className="overflow-hidden rounded-2xl border border-line bg-background">
          {editor ? (
            <>
              <Toolbar
                editor={editor}
                uploading={uploading === "inline"}
                onImage={() => inlineInput.current?.click()}
              />
              <EditorContent editor={editor} />
            </>
          ) : (
            <div className="min-h-[24rem] p-8 text-muted">Loading editor…</div>
          )}
          <input
            ref={inlineInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            className="hidden"
            onChange={(e) => {
              void pickInlineImage(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
      </div>
    </form>
  );
}
