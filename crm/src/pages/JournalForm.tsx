import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapLink from "@tiptap/extension-link";
import { useAuth } from "../context/AuthContext";
import { authedFetch } from "../lib/api";
import { AdminLayout } from "../components/AdminLayout";
import type { BlogPost } from "../types";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface FormState {
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  author: string;
  date: string;
  tags: string;
}

const EMPTY: FormState = {
  slug: "",
  title: "",
  excerpt: "",
  cover: "",
  author: "Team RnD Muse",
  date: new Date().toISOString().slice(0, 10),
  tags: "",
};

function postToForm(p: BlogPost): FormState {
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    cover: p.cover,
    author: p.author,
    date: p.date.slice(0, 10),
    tags: p.tags.join(", "),
  };
}

export function JournalForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { getIdToken } = useAuth();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const editor = useEditor({
    extensions: [StarterKit, TiptapLink.configure({ openOnClick: false })],
    content: "",
  });

  useEffect(() => {
    if (!id) return;
    getIdToken().then(async (idToken) => {
      const res = await authedFetch(`/api/admin?resource=post&id=${id}`, idToken);
      if (res.ok) {
        const post: BlogPost = await res.json();
        setForm(postToForm(post));
        setSlugTouched(true);
        editor?.commands.setContent(post.body);
      } else {
        setError("Post not found");
      }
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, getIdToken, editor]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onTitleChange = (value: string) => {
    set("title", value);
    if (!slugTouched) set("slug", slugify(value));
  };

  const submit = async () => {
    setError("");
    const payload = {
      slug: form.slug.trim(),
      title: form.title.trim(),
      excerpt: form.excerpt,
      cover: form.cover.trim(),
      author: form.author.trim(),
      date: form.date,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      body: editor?.getHTML() ?? "",
    };
    if (!payload.slug || !payload.title || !payload.cover || !payload.author || !payload.date) {
      setError("Title, slug, cover image and author are required.");
      return;
    }
    setSaving(true);
    try {
      const idToken = await getIdToken();
      const res = isEdit
        ? await authedFetch(`/api/admin?resource=post&id=${id}`, idToken, {
            method: "PUT",
            body: JSON.stringify(payload),
          })
        : await authedFetch("/api/admin?resource=posts", idToken, {
            method: "POST",
            body: JSON.stringify(payload),
          });
      if (!res.ok) throw new Error("Save failed");
      navigate("/journal");
    } catch {
      setError("Couldn't save post — check the fields and try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <p className="text-sm text-plum/50">Loading…</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Link to="/journal" className="text-sm text-plum/60 hover:text-plum">← Journal</Link>
      <h1 className="mt-2 text-2xl text-plum">{isEdit ? "Edit post" : "New post"}</h1>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 max-w-2xl space-y-6">
        <div className="rounded-xl2 bg-white p-6 shadow-soft">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" span2>
              <input value={form.title} onChange={(e) => onTitleChange(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Slug" span2>
              <input
                value={form.slug}
                onChange={(e) => { setSlugTouched(true); set("slug", e.target.value); }}
                className={inputCls}
              />
            </Field>
            <Field label="Author">
              <input value={form.author} onChange={(e) => set("author", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Date">
              <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Cover image URL" span2>
              <input value={form.cover} onChange={(e) => set("cover", e.target.value)} className={inputCls} placeholder="https://…" />
            </Field>
            <Field label="Keywords / tags (comma-separated)" span2>
              <input value={form.tags} onChange={(e) => set("tags", e.target.value)} className={inputCls} placeholder="festive, styling" />
            </Field>
            <Field label="Excerpt" span2>
              <textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} rows={2} className={inputCls} />
            </Field>
          </div>
        </div>

        <div className="rounded-xl2 bg-white p-6 shadow-soft">
          <span className="mb-2 block text-sm font-medium text-plum">Body</span>
          {editor && (
            <div className="mb-3 flex flex-wrap gap-1 border-b border-plum/10 pb-3">
              <ToolbarButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>B</ToolbarButton>
              <ToolbarButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>I</ToolbarButton>
              <ToolbarButton active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolbarButton>
              <ToolbarButton active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</ToolbarButton>
              <ToolbarButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</ToolbarButton>
              <ToolbarButton active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</ToolbarButton>
              <ToolbarButton
                active={editor.isActive("link")}
                onClick={() => {
                  const url = window.prompt("Link URL");
                  if (url) editor.chain().focus().setLink({ href: url }).run();
                  else editor.chain().focus().unsetLink().run();
                }}
              >
                Link
              </ToolbarButton>
            </div>
          )}
          <EditorContent
            editor={editor}
            className="min-h-[240px] max-w-none rounded-xl border border-plum/20 p-4 text-sm text-ink/80 focus-within:border-brass [&_.ProseMirror]:outline-none [&_a]:text-brass [&_a]:underline [&_h2]:mt-4 [&_h2]:font-display [&_h2]:text-xl [&_h2]:text-plum [&_h3]:mt-3 [&_h3]:font-display [&_h3]:text-lg [&_h3]:text-plum [&_li]:mb-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_p]:leading-relaxed [&_strong]:text-plum [&_ul]:list-disc [&_ul]:pl-5"
          />
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={saving}
          className="rounded-full bg-plum px-8 py-3 text-sm font-semibold text-ivory hover:bg-berry disabled:opacity-40"
        >
          {saving ? "Saving…" : isEdit ? "Save changes" : "Publish post"}
        </button>
      </div>
    </AdminLayout>
  );
}

const inputCls =
  "w-full rounded-xl border border-plum/20 bg-white px-4 py-2.5 text-sm outline-none focus:border-brass";

function Field({ label, span2, children }: { label: string; span2?: boolean; children: ReactNode }) {
  return (
    <label className={`block ${span2 ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-sm font-medium text-plum">{label}</span>
      {children}
    </label>
  );
}

function ToolbarButton({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
        active ? "bg-plum text-ivory" : "bg-plum/5 text-plum hover:bg-plum/10"
      }`}
    >
      {children}
    </button>
  );
}
