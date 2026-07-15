-- Run this once in the Supabase SQL Editor for the project used by this app.
-- Row Level Security is enabled with NO public policies: only the service-role
-- key (used server-side in api/_lib/supabase.ts) can read or write this table.
-- The anon/public key must never be granted access to `orders`.

create extension if not exists pgcrypto;

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  address_line text not null,
  city text not null,
  state text not null,
  pincode text not null,
  country text not null default 'India',

  items jsonb not null,
  subtotal numeric not null,
  shipping numeric not null,
  tax numeric not null,
  total numeric not null,

  payment_method text not null check (payment_method in ('razorpay', 'cod')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'cod_pending')),
  razorpay_order_id text,
  razorpay_payment_id text,

  shiprocket_order_id text,
  shiprocket_shipment_id text,
  awb_code text,
  courier_name text,

  status text not null default 'created'
    check (status in ('created', 'confirmed', 'shipped', 'delivered', 'cancelled'))
);

alter table orders enable row level security;
-- Intentionally no policies added: default-deny for anon/authenticated roles.
-- All access happens server-side via the service-role key, which bypasses RLS.

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists orders_set_updated_at on orders;
create trigger orders_set_updated_at
  before update on orders
  for each row execute function set_updated_at();

-- ---- Customer accounts ----
-- user_id columns are plain text (Supabase Auth uid strings) rather than a
-- declared `references auth.users(id)` FK, so PostgREST embedding across
-- them isn't available -- admin aggregate views join these in application
-- code instead (see api/_lib/profiles.ts's listAllCustomers). Same security
-- model as `orders`: RLS enabled, zero public policies. All access happens
-- server-side via the service-role key after the caller's Supabase Auth JWT
-- has been verified in api/_lib/auth.ts.

create table if not exists profiles (
  id text primary key, -- Supabase Auth uid
  name text,
  phone text,          -- cached from the auth user at first login
  email text,           -- cached from the auth user at first login
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table profiles enable row level security;

create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  label text,
  name text not null,
  phone text not null,
  address_line text not null,
  city text not null,
  state text not null,
  pincode text not null,
  country text not null default 'India',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists addresses_user_id_idx on addresses(user_id);
alter table addresses enable row level security;

create table if not exists wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  product_id text not null, -- references src/data/products.ts, not a DB FK
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);
create index if not exists wishlist_user_id_idx on wishlist(user_id);
alter table wishlist enable row level security;

do $$ begin
  create type return_status as enum ('requested', 'approved', 'rejected', 'completed');
exception
  when duplicate_object then null; -- already exists, safe to re-run this file
end $$;

create table if not exists returns (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  user_id text,
  reason text not null,
  item_ids text[],  -- null/empty = whole-order return
  status return_status not null default 'requested',
  requested_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists returns_order_id_idx on returns(order_id);
create index if not exists returns_user_id_idx on returns(user_id);
alter table returns enable row level security;

drop trigger if exists profiles_set_updated_at on profiles;
create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

drop trigger if exists addresses_set_updated_at on addresses;
create trigger addresses_set_updated_at
  before update on addresses
  for each row execute function set_updated_at();

drop trigger if exists returns_set_updated_at on returns;
create trigger returns_set_updated_at
  before update on returns
  for each row execute function set_updated_at();

-- Ties orders to accounts; nullable so guest checkout keeps working unchanged.
alter table orders add column if not exists user_id text;
create index if not exists orders_user_id_idx on orders(user_id);

-- Added after the initial profiles table shipped; `create table if not
-- exists` above won't add this to an already-existing table.
alter table profiles add column if not exists email text;

-- Customer-facing order number ("ORD-XXXXXXXXXXXXXXX"), distinct from the
-- internal uuid `id` used for URLs/lookups. Generated in api/_lib/orders.ts
-- at insert time, not by a DB default.
alter table orders add column if not exists order_number text unique;
