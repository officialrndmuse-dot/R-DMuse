import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { usePosts, allTagsFrom } from "../hooks/usePosts";
import { formatDate } from "../lib/format";
import type { ReactNode } from "react";

export function Blog() {
  const { posts, loading } = usePosts();
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);

  const allTags = useMemo(() => allTagsFrom(posts), [posts]);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchesTag = !tag || p.tags.includes(tag);
      const q = query.toLowerCase();
      const matchesQuery =
        !q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q);
      return matchesTag && matchesQuery;
    });
  }, [posts, query, tag]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-4xl text-plum">The Journal</h1>
      <p className="mt-2 text-plum/60">Styling notes, care tips and festive edits.</p>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <TagChip active={!tag} onClick={() => setTag(null)}>All</TagChip>
          {allTags.map((t) => (
            <TagChip key={t} active={tag === t} onClick={() => setTag(t)}>{`#${t}`}</TagChip>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles…"
          aria-label="Search articles"
          className="rounded-full border border-plum/20 bg-white px-4 py-2 text-sm focus:border-brass"
        />
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {filtered.map((p) => (
          <Link
            key={p.id}
            to={`/blog/${p.slug}`}
            className="group overflow-hidden rounded-xl2 bg-white shadow-soft"
          >
            <div className="aspect-[16/10] overflow-hidden">
              <img src={p.cover} alt={p.title} loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="p-5">
              <p className="text-xs uppercase tracking-wider text-brass">{formatDate(p.date)}</p>
              <h2 className="mt-2 font-display text-xl text-plum group-hover:underline">{p.title}</h2>
              <p className="mt-2 text-sm text-plum/60">{p.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>

      {loading && <p className="mt-10 text-center text-plum/50">Loading…</p>}

      {!loading && filtered.length === 0 && (
        <p className="mt-10 text-center text-plum/50">No articles match that filter yet.</p>
      )}
    </div>
  );
}

function TagChip({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
        active ? "bg-plum text-ivory" : "bg-white text-plum border border-plum/15 hover:border-brass"
      }`}
    >
      {children}
    </button>
  );
}
