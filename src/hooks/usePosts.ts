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

// Module-level cache, same rationale as useProducts.ts — one fetch per
// browser session instead of one per page visit.
let cache: BlogPost[] | null = null;
let inflight: Promise<BlogPost[]> | null = null;

function fetchAllPosts(): Promise<BlogPost[]> {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;
  if (!supabase) return Promise.resolve([]);

  inflight = Promise.resolve(
    supabase
      .from("posts")
      .select()
      .order("date", { ascending: false })
      .then(({ data, error }) => {
        const result = !error && data ? (data as unknown as PostRow[]).map(rowToPost) : [];
        cache = result;
        inflight = null;
        return result;
      })
  );
  return inflight;
}

export function usePosts() {
  const [posts, setPosts] = useState<BlogPost[]>(cache ?? []);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) {
      setPosts(cache);
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetchAllPosts().then((result) => {
      if (cancelled) return;
      setPosts(result);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { posts, loading };
}

export function usePost(slug?: string) {
  const [post, setPost] = useState<BlogPost | undefined>(() =>
    slug ? cache?.find((p) => p.slug === slug) : undefined
  );
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetchAllPosts().then((result) => {
      if (cancelled) return;
      setPost(result.find((p) => p.slug === slug));
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
