# RnD Muse — E-commerce Starter

Ethnic × modern accessories store (bags, earrings, festive picks) for **RnD Muse**,
by Ronit & Dhruv. React + TypeScript + Vite + Tailwind, with a cart, catalog,
blog, and mock checkout.

## Quick start

```bash
# 1. Install dependencies (needs Node 18+)
npm install

# 2. Run the dev server  ->  http://localhost:5173
npm run dev
```

That's it — the app runs fully on local sample data, no backend needed.

### Optional: run the mock REST API
The catalog/blog can be served from a fake API instead of local files:

```bash
npm run api      # json-server on http://localhost:4000
```
Then in `src/hooks/useProducts.ts`, swap the local import for a `fetch` to
`http://localhost:4000/products`. Endpoints available: `/products`, `/posts`.

## Build for production

```bash
npm run build    # outputs static files to /dist
npm run preview  # preview the production build locally
```
Deploy the `/dist` folder to Netlify, Vercel, Cloudflare Pages, or any static host.
(For client-side routing, add a redirect rule sending all paths to /index.html.)

## Project structure

```
src/
  types.ts              Data models (Product, CartItem, BlogPost)
  data/                 Sample products + blog posts
  context/CartContext   Cart store (useReducer + localStorage)
  hooks/useProducts     Product access + filter/sort logic
  lib/format            ₹ currency + date helpers
  components/           Header, Footer, ProductCard, ProductList, atoms
  pages/                Home, Catalog, ProductDetail, Cart, Checkout,
                        Blog, BlogPost, About
```

## Routes

| Path              | Page          |
|-------------------|---------------|
| `/`               | Home          |
| `/shop`           | Catalog (filter/search/sort; `?category=` in URL) |
| `/product/:id`    | Product detail |
| `/cart`           | Cart          |
| `/checkout`       | Mock checkout |
| `/blog`           | Journal list  |
| `/blog/:slug`     | Article       |
| `/about`          | About / founders |

## What to customise first
1. **Products** — edit `src/data/products.ts` (and `db.json` if using the API).
2. **Images** — drop real photos in a `public/` folder and point `image` paths to them.
3. **Brand** — colours live in `tailwind.config.js`; fonts in `index.html`.
4. **Payments** — replace `handleSubmit` in `src/pages/Checkout.tsx` with Razorpay/Stripe.

## Next steps (post-MVP)
- Real backend + database (orders, inventory)
- Auth & customer accounts, order history
- Payment gateway (Razorpay is easiest for India)
- Wishlist, reviews, coupon codes
- SEO: consider migrating to Next.js for server rendering
