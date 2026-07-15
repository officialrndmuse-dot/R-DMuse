import { getSupabase } from "./supabase.js";
import type { BlogPost } from "../../src/types.js";

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
  created_at: string;
  updated_at: string;
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
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface PostInput {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover: string;
  author: string;
  date: string;
  tags: string[];
}

export async function listPosts(): Promise<BlogPost[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("posts").select().order("date", { ascending: false });
  if (error) throw new Error(`Failed to list posts: ${error.message}`);
  return (data as PostRow[]).map(rowToPost);
}

export async function getPost(id: string): Promise<BlogPost | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("posts").select().eq("id", id).maybeSingle();
  if (error) throw new Error(`Failed to get post: ${error.message}`);
  return data ? rowToPost(data as PostRow) : null;
}

export async function createPost(input: PostInput): Promise<BlogPost> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("posts").insert(input).select().single();
  if (error) throw new Error(`Failed to create post: ${error.message}`);
  return rowToPost(data as PostRow);
}

export async function updatePost(id: string, input: PostInput): Promise<BlogPost | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("posts")
    .update(input)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw new Error(`Failed to update post: ${error.message}`);
  return data ? rowToPost(data as PostRow) : null;
}

export async function deletePost(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete post: ${error.message}`);
}
