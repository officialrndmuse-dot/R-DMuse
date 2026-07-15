import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authedFetch } from "../lib/api";
import { AdminLayout } from "../components/AdminLayout";
import type { BlogPost } from "../types";

export function Journal() {
  const { getIdToken } = useAuth();
  const [posts, setPosts] = useState<BlogPost[] | null>(null);

  const load = async () => {
    const idToken = await getIdToken();
    const res = await authedFetch("/api/admin?resource=posts", idToken);
    if (res.ok) setPosts(await res.json());
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remove = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This can't be undone.`)) return;
    const idToken = await getIdToken();
    await authedFetch(`/api/admin?resource=post&id=${id}`, idToken, { method: "DELETE" });
    load();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-plum">Journal</h1>
        <Link
          to="/journal/new"
          className="rounded-full bg-plum px-5 py-2 text-sm font-semibold text-ivory hover:bg-berry"
        >
          + New post
        </Link>
      </div>

      {posts === null ? (
        <p className="mt-6 text-sm text-plum/50">Loading…</p>
      ) : posts.length === 0 ? (
        <p className="mt-6 text-sm text-plum/50">No posts yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl2 bg-white shadow-soft">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-plum/10 text-plum/50">
                <th className="p-4 font-medium">Title</th>
                <th className="p-4 font-medium">Author</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Tags</th>
                <th className="p-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-b border-plum/5 last:border-0">
                  <td className="p-4">
                    <Link to={`/journal/${p.id}`} className="flex items-center gap-3">
                      <img src={p.cover} alt={p.title} className="h-10 w-16 rounded-lg object-cover" />
                      <span className="font-medium text-plum hover:underline">{p.title}</span>
                    </Link>
                  </td>
                  <td className="p-4 text-plum/70">{p.author}</td>
                  <td className="p-4 text-plum/50">{new Date(p.date).toLocaleDateString("en-IN")}</td>
                  <td className="p-4 text-plum/70">
                    {p.tags.map((t) => `#${t}`).join(" ")}
                  </td>
                  <td className="p-4 text-right">
                    <Link to={`/journal/${p.id}`} className="mr-3 text-brass hover:underline">Edit</Link>
                    <button
                      type="button"
                      onClick={() => remove(p.id, p.title)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
