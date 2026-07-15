import { Link, useParams } from "react-router-dom";
import { usePost } from "../hooks/usePosts";
import { formatDate } from "../lib/format";

export function BlogPost() {
  const { slug } = useParams();
  const { post, loading } = usePost(slug);

  if (loading) {
    return <div className="mx-auto max-w-2xl px-4 py-24 text-center text-plum/50">Loading…</div>;
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-3xl text-plum">Article not found</h1>
        <Link to="/blog" className="mt-4 inline-block text-brass hover:underline">← Back to Journal</Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-2xl px-4 py-10">
      <Link to="/blog" className="text-sm text-plum/60 hover:text-plum">← Journal</Link>
      <p className="mt-6 text-xs uppercase tracking-wider text-brass">
        {formatDate(post.date)} · {post.author}
      </p>
      <h1 className="mt-2 font-display text-4xl leading-tight text-plum">{post.title}</h1>

      <img src={post.cover} alt={post.title} className="mt-6 aspect-[16/9] w-full rounded-xl2 object-cover" />

      <div
        className="prose mt-8 max-w-none text-ink/80 [&_a]:text-brass [&_a]:underline [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-plum [&_h3]:mt-4 [&_h3]:font-display [&_h3]:text-xl [&_h3]:text-plum [&_li]:mb-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-4 [&_p]:leading-relaxed [&_strong]:text-plum [&_ul]:list-disc [&_ul]:pl-5"
        dangerouslySetInnerHTML={{ __html: post.body }}
      />

      <div className="mt-8 flex flex-wrap gap-2">
        {post.tags.map((t) => (
          <span key={t} className="rounded-full bg-blush/30 px-3 py-1 text-xs text-plum">#{t}</span>
        ))}
      </div>
    </article>
  );
}
