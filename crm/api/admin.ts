import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuthedUser, requireAdmin } from "./_lib/auth.js";
import { listAllReturns, updateReturnStatus } from "./_lib/returns.js";
import { listAllOrders, listOrdersForUser } from "./_lib/orders.js";
import { listAllCustomers, getProfile } from "./_lib/profiles.js";
import { listAddresses } from "./_lib/addresses.js";
import { getDashboardStats } from "./_lib/dashboard.js";
import {
  listProducts, getProduct, createProduct, updateProduct, deleteProduct,
  type ProductInput,
} from "./_lib/products.js";
import {
  listPosts, getPost, createPost, updatePost, deletePost,
  type PostInput,
} from "./_lib/posts.js";
import type { ReturnStatus, Product } from "../src/types.js";

const CATEGORIES: Product["category"][] = ["bags", "earrings", "festive", "hair", "bangles"];

function toProductInput(body: any): ProductInput | null {
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const category = body?.category;
  const price = Number(body?.price);
  const stock = Number(body?.stock);
  const image = typeof body?.image === "string" ? body.image.trim() : "";
  const description = typeof body?.description === "string" ? body.description : "";
  const weightKg = Number(body?.weightKg);
  const lengthCm = Number(body?.lengthCm);
  const breadthCm = Number(body?.breadthCm);
  const heightCm = Number(body?.heightCm);
  if (
    !name || !CATEGORIES.includes(category) || !Number.isFinite(price) ||
    !Number.isFinite(stock) || !image ||
    !Number.isFinite(weightKg) || !Number.isFinite(lengthCm) ||
    !Number.isFinite(breadthCm) || !Number.isFinite(heightCm)
  ) {
    return null;
  }
  const mrp = body?.mrp === null || body?.mrp === undefined || body?.mrp === "" ? null : Number(body.mrp);
  return {
    name, category, price, stock, image, description,
    mrp: mrp !== null && Number.isFinite(mrp) ? mrp : null,
    rating: Number.isFinite(Number(body?.rating)) ? Number(body.rating) : 5,
    tags: Array.isArray(body?.tags) ? body.tags.filter((t: unknown) => typeof t === "string") : [],
    sku: typeof body?.sku === "string" && body.sku.trim() ? body.sku.trim() : null,
    weightKg, lengthCm, breadthCm, heightCm,
  };
}

function toPostInput(body: any): PostInput | null {
  const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const cover = typeof body?.cover === "string" ? body.cover.trim() : "";
  const author = typeof body?.author === "string" ? body.author.trim() : "";
  const date = typeof body?.date === "string" ? body.date : "";
  if (!slug || !title || !cover || !author || !date) return null;
  return {
    slug, title, cover, author, date,
    excerpt: typeof body?.excerpt === "string" ? body.excerpt : "",
    body: typeof body?.body === "string" ? body.body : "",
    tags: Array.isArray(body?.tags) ? body.tags.filter((t: unknown) => typeof t === "string") : [],
  };
}

const VALID_STATUSES: ReturnStatus[] = ["requested", "approved", "rejected", "completed"];

const adminEmails = () =>
  (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

// Single endpoint, keyed by ?resource=, mirroring the pattern proven in the
// storefront's own admin API before this was split into its own app.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const resource = typeof req.query.resource === "string" ? req.query.resource : "";

  if (resource === "whoami") {
    if (req.method !== "GET") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }
    const user = await requireAuthedUser(req, res);
    if (!user) return;
    const isAdmin = !!user.email && adminEmails().includes(user.email.toLowerCase());
    res.status(200).json({ isAdmin });
    return;
  }

  if (resource === "returns") {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    if (req.method === "GET") {
      res.status(200).json(await listAllReturns());
      return;
    }

    if (req.method === "PATCH") {
      const id = typeof req.body?.id === "string" ? req.body.id : "";
      const status = req.body?.status as ReturnStatus;
      if (!id || !VALID_STATUSES.includes(status)) {
        res.status(400).json({ error: "Invalid id or status" });
        return;
      }
      const updated = await updateReturnStatus(id, status);
      if (!updated) {
        res.status(404).json({ error: "Return not found" });
        return;
      }
      res.status(200).json(updated);
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (resource === "orders") {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    if (req.method !== "GET") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }
    res.status(200).json(await listAllOrders());
    return;
  }

  if (resource === "customers") {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    if (req.method !== "GET") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }
    res.status(200).json(await listAllCustomers());
    return;
  }

  if (resource === "customer") {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    if (req.method !== "GET") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }
    const id = typeof req.query.id === "string" ? req.query.id : "";
    if (!id) {
      res.status(400).json({ error: "Missing customer id" });
      return;
    }
    const [profile, orders, addresses] = await Promise.all([
      getProfile(id),
      listOrdersForUser(id),
      listAddresses(id),
    ]);
    if (!profile) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }
    res.status(200).json({ profile, orders, addresses });
    return;
  }

  if (resource === "dashboard") {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    if (req.method !== "GET") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }
    res.status(200).json(await getDashboardStats());
    return;
  }

  if (resource === "products") {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    if (req.method === "GET") {
      res.status(200).json(await listProducts());
      return;
    }
    if (req.method === "POST") {
      const input = toProductInput(req.body);
      if (!input) {
        res.status(400).json({ error: "Invalid product data" });
        return;
      }
      res.status(201).json(await createProduct(input));
      return;
    }
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (resource === "product") {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const id = typeof req.query.id === "string" ? req.query.id : "";
    if (!id) {
      res.status(400).json({ error: "Missing product id" });
      return;
    }

    if (req.method === "GET") {
      const product = await getProduct(id);
      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }
      res.status(200).json(product);
      return;
    }
    if (req.method === "PUT") {
      const input = toProductInput(req.body);
      if (!input) {
        res.status(400).json({ error: "Invalid product data" });
        return;
      }
      const updated = await updateProduct(id, input);
      if (!updated) {
        res.status(404).json({ error: "Product not found" });
        return;
      }
      res.status(200).json(updated);
      return;
    }
    if (req.method === "DELETE") {
      await deleteProduct(id);
      res.status(204).end();
      return;
    }
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (resource === "posts") {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    if (req.method === "GET") {
      res.status(200).json(await listPosts());
      return;
    }
    if (req.method === "POST") {
      const input = toPostInput(req.body);
      if (!input) {
        res.status(400).json({ error: "Invalid post data" });
        return;
      }
      res.status(201).json(await createPost(input));
      return;
    }
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (resource === "post") {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const id = typeof req.query.id === "string" ? req.query.id : "";
    if (!id) {
      res.status(400).json({ error: "Missing post id" });
      return;
    }

    if (req.method === "GET") {
      const post = await getPost(id);
      if (!post) {
        res.status(404).json({ error: "Post not found" });
        return;
      }
      res.status(200).json(post);
      return;
    }
    if (req.method === "PUT") {
      const input = toPostInput(req.body);
      if (!input) {
        res.status(400).json({ error: "Invalid post data" });
        return;
      }
      const updated = await updatePost(id, input);
      if (!updated) {
        res.status(404).json({ error: "Post not found" });
        return;
      }
      res.status(200).json(updated);
      return;
    }
    if (req.method === "DELETE") {
      await deletePost(id);
      res.status(204).end();
      return;
    }
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  res.status(404).json({ error: "Unknown resource" });
}
