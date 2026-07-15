# RnD Muse — E-commerce Site

Ethnic × modern accessories store (bags, earrings, festive picks) for **RnD Muse**,
by Ronit & Dhruv. React + TypeScript + Vite + Tailwind frontend, with Vercel
serverless functions for checkout (Razorpay + Shiprocket) and customer
accounts (Supabase Auth — phone/OTP and email/password), backed by
Supabase (Postgres).

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
Environment Variables. See `.env.example` for the full list — the
`SUPABASE_SERVICE_ROLE_KEY`, Razorpay, and Shiprocket credentials are
server-only; `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` (the anon/public
key) are safe to expose in the browser bundle — that key alone can't read
or write any table, since RLS is enabled with zero public policies.

The Supabase database schema lives in `supabase/schema.sql` — run it once in
the Supabase SQL Editor for the project referenced by `SUPABASE_URL`.

Email/password sign-in works out of the box (Supabase enables it by
default). Phone/OTP sign-in additionally needs an SMS provider (e.g. Twilio)
connected under Supabase Dashboard → Authentication → Providers → Phone —
until that's configured, the "Phone OTP" tab on `/account/login` will show
an error, but "Email & password" works regardless.

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
  context/AuthContext         Supabase Auth session state
  context/WishlistContext     Wishlist state (loaded when signed in)
  lib/                        Pricing, formatting, Supabase/API client helpers
  components/                 Header, Footer, ProductCard, route guards
  components/account/         Account layout + nav shared across /account pages
  pages/                      Home, Catalog, ProductDetail, Cart, Checkout, ...
  pages/account/              Customer account area (login, orders, addresses, ...)
  pages/admin/                Admin login + returns management

api/
  _lib/                       Server-side helpers (Supabase, Razorpay,
                               Shiprocket, validation)
  create-order.ts             Checkout: creates an order, associates the
                               signed-in user if any, kicks off payment/shipping
  verify-payment.ts           Razorpay signature verification -> Shiprocket
  track-order.ts              Public order status lookup
  account/                    Authenticated endpoints: profile.ts (also
                               claims prior guest orders by phone match),
                               orders.ts, addresses.ts, wishlist.ts, returns.ts
                               — collection + single-item ops share one file
                               per resource (?id= query param) to stay under
                               Vercel's Hobby-plan 12-function cap
  admin.ts                    Admin-only endpoint, keyed by ?resource=
                               (whoami, returns)

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
| `/account/login`       | Customer login (phone/OTP or email/password) |
| `/account`             | Account overview                          |
| `/account/orders`      | Order history                             |
| `/account/addresses`   | Saved addresses                           |
| `/account/wishlist`    | Wishlist                                  |
| `/account/profile`     | Edit profile                              |
| `/account/support`     | Support / contact info                    |
| `/account/returns`     | Request & track returns                   |
| `/admin/login`         | Admin login (email/password, allow-listed) |
| `/admin/returns`       | Admin: manage return requests             |

## What to customise first
1. **Products** — edit `src/data/products.ts`. Fill in real `weightKg`/dimensions
   per product before relying on Shiprocket's shipping-rate calculation.
2. **Images** — drop real photos in a `public/` folder and point `image` paths to them.
3. **Brand** — colours live in `tailwind.config.js`; fonts in `index.html`.
4. **Tax/shipping** — `src/lib/pricing.ts` has placeholder flat rates; wire up real GST logic.

## Security model
Row Level Security is enabled with **zero public policies** on every table.
The browser only ever holds the anon/public Supabase key (`src/lib/supabaseClient.ts`),
used solely to sign in and obtain a session JWT — it cannot read or write
`orders`/`profiles`/`addresses`/`wishlist`/`returns` directly. All actual data
access goes through `api/` functions, which verify that JWT server-side
(`api/_lib/auth.ts`) using the service-role key (`SUPABASE_SERVICE_ROLE_KEY`,
never exposed to the client), then manually scope every query to that user's
id. There is no RLS safety net, so every new authenticated endpoint must
filter by the caller's uid explicitly.

Admin access (`/admin/*`) uses the same Supabase Auth session as customers —
any account whose email is on the `ADMIN_EMAILS` allow-list (checked
server-side) can reach it. There's no separate signup flow for admins: sign
up via the normal email/password option on `/account/login`, then add that
email to `ADMIN_EMAILS`.
