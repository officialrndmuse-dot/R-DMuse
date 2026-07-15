import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { BlogPost } from "../types";

// Row shape as stored in Supabase (snake_case columns, see supabase/schema.sql)
interface PostRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover: string;
  author: string;
  date: string;
  tags: string[];
}

function rowToPost(row: PostRow): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    cover: row.cover,
    author: row.author,
    date: row.date,
    tags: row.tags,
  };
}

export function usePosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    supabase
      .from("posts")
      .select()
      .order("date", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (!error && data) setPosts((data as unknown as PostRow[]).map(rowToPost));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { posts, loading };
}

export function usePost(slug?: string) {
  const [post, setPost] = useState<BlogPost | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug || !supabase) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    supabase
      .from("posts")
      .select()
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        setPost(!error && data ? rowToPost(data as unknown as PostRow) : undefined);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { post, loading };
}

// Unique tags across a set of posts — used to build the blog filter chips.
export function allTagsFrom(posts: BlogPost[]): string[] {
  return Array.from(new Set(posts.flatMap((p) => p.tags))).sort();
}
