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
