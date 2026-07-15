# RnD Muse — E-commerce Site

Ethnic × modern accessories store (bags, earrings, festive picks) for **RnD Muse**,
by Ronit & Dhruv. React + TypeScript + Vite + Tailwind frontend, with Vercel
serverless functions for checkout (Razorpay + Shiprocket) and customer
accounts (Firebase Auth), backed by Supabase (Postgres).

## Quick start

```bash
# 1. Install dependencies (needs Node 18+)
npm install

# 2. Run the dev server  ->  http://localhost:5173
npm run dev
```

The product catalog runs fully on local sample data. Checkout, orders, and
account features need the backend env vars below and only work when deployed
to Vercel (or run locally via `vercel dev`) — the plain Vite dev server does
not serve the `api/` functions.

### Optional: run the mock REST API
The catalog/blog can be served from a fake API instead of local files:

```bash
npm run api      # json-server on http://localhost:4000
```
Then in `src/hooks/useProducts.ts`, swap the local import for a `fetch` to
`http://localhost:4000/products`. Endpoints available: `/products`, `/posts`.

## Environment variables

Copy `.env.example` to `.env` and fill in real values (never commit `.env`).
In production, set the same variables under Vercel Project Settings →
Environment Variables. See `.env.example` for the full list — Supabase,
Razorpay, and Shiprocket credentials are server-only; Firebase's client
config (`VITE_FIREBASE_*`) is safe to expose in the browser bundle.

The Supabase database schema lives in `supabase/schema.sql` — run it once in
the Supabase SQL Editor for the project referenced by `SUPABASE_URL`.

## Build for production

```bash
npm run build    # outputs static files to /dist
npm run preview  # preview the production build locally
```
Deployed on Vercel (`api/` functions + static frontend from one project).

## Project structure

```
src/
  types.ts                    Data models (Product, Order, Profile, Address, ...)
  data/                       Sample products + blog posts
  context/CartContext         Cart store (useReducer + localStorage)
  context/AuthContext         Firebase auth session state
  context/WishlistContext     Wishlist state (loaded when signed in)
  lib/                        Pricing, formatting, Firebase/API client helpers
  components/                 Header, Footer, ProductCard, route guards
  components/account/         Account layout + nav shared across /account pages
  pages/                      Home, Catalog, ProductDetail, Cart, Checkout, ...
  pages/account/              Customer account area (login, orders, addresses, ...)
  pages/admin/                Admin login + returns management

api/
  _lib/                       Server-side helpers (Supabase, Firebase Admin,
                               Razorpay, Shiprocket, validation)
  create-order.ts             Checkout: creates an order, associates the
                               signed-in user if any, kicks off payment/shipping
  verify-payment.ts           Razorpay signature verification -> Shiprocket
  track-order.ts              Public order status lookup
  account/                    Authenticated endpoints (profile, orders,
                               addresses, wishlist, returns, claim-orders)
  admin/                      Admin-only endpoints (returns management)

supabase/schema.sql           Full Postgres schema (orders, profiles,
                               addresses, wishlist, returns)
```

## Routes

| Path                  | Page                                    |
|------------------------|------------------------------------------|
| `/`                    | Home                                      |
| `/shop`                | Catalog (filter/search/sort; `?category=` in URL) |
| `/product/:id`         | Product detail                            |
| `/cart`                | Cart                                      |
| `/checkout`            | Checkout (COD or Razorpay)                |
| `/order/:id`           | Order tracking (public, by order id)      |
| `/blog`, `/blog/:slug` | Journal                                   |
| `/about`               | About / founders                          |
| `/account/login`       | Customer phone/OTP login                  |
| `/account`             | Account overview                          |
| `/account/orders`      | Order history                             |
| `/account/addresses`   | Saved addresses                           |
| `/account/wishlist`    | Wishlist                                  |
| `/account/profile`     | Edit profile                              |
| `/account/support`     | Support / contact info                    |
| `/account/returns`     | Request & track returns                   |
| `/admin/login`         | Admin email/password login                |
| `/admin/returns`       | Admin: manage return requests             |

## What to customise first
1. **Products** — edit `src/data/products.ts`. Fill in real `weightKg`/dimensions
   per product before relying on Shiprocket's shipping-rate calculation.
2. **Images** — drop real photos in a `public/` folder and point `image` paths to them.
3. **Brand** — colours live in `tailwind.config.js`; fonts in `index.html`.
4. **Tax/shipping** — `src/lib/pricing.ts` has placeholder flat rates; wire up real GST logic.

## Security model
Supabase is used purely as a database (service-role key, server-side only) —
Row Level Security is enabled with **zero public policies** on every table.
All access goes through `api/` functions, which verify the caller's Firebase
ID token first, then manually scope every query to that user's id. There is
no RLS safety net, so every new authenticated endpoint must filter by the
caller's uid explicitly.
