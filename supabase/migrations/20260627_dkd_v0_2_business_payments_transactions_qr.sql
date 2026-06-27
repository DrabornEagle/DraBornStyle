create extension if not exists pgcrypto;

create table if not exists public.dkd_business_payment_settings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null unique,
  default_platform_fee numeric(12,2) not null default 20.00,
  payment_cycle text not null default 'weekly' check (payment_cycle in ('weekly','monthly','custom')),
  weekly_due_day integer check (weekly_due_day between 1 and 7),
  monthly_due_day integer check (monthly_due_day between -1 and 31),
  next_due_date date,
  reminder_enabled boolean not null default true,
  status text not null default 'active' check (status in ('active','paused','blocked')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dkd_qr_sources (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  qr_code text not null unique,
  title text not null default 'İşletme QR',
  source_type text not null default 'business_qr' check (source_type in ('business_qr','master_qr','campaign_qr')),
  master_id uuid,
  is_active boolean not null default true,
  scan_count integer not null default 0,
  last_scanned_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dkd_discount_codes (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  master_id uuid,
  code text not null unique,
  title text,
  description text,
  discount_type text not null check (discount_type in ('fixed','percent')),
  discount_value numeric(12,2) not null check (discount_value >= 0),
  service_id uuid,
  usage_limit integer,
  used_count integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dkd_service_transactions (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid,
  business_id uuid not null,
  master_id uuid,
  customer_id uuid,
  service_id uuid,
  source text not null default 'app' check (source in ('app','web','qr','walk_in','admin')),
  qr_source_id uuid references public.dkd_qr_sources(id) on delete set null,
  discount_code_id uuid references public.dkd_discount_codes(id) on delete set null,
  status text not null default 'draft' check (status in ('draft','started','completed','cancelled','refunded')),
  service_title text,
  base_price numeric(12,2) not null default 0,
  extra_price numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  final_price numeric(12,2) not null default 0,
  platform_fee_amount numeric(12,2) not null default 20.00,
  started_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  final_price_note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dkd_business_platform_fees (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  transaction_id uuid references public.dkd_service_transactions(id) on delete cascade,
  amount numeric(12,2) not null default 20.00,
  source text not null default 'transaction' check (source in ('transaction','manual_adjustment','correction')),
  status text not null default 'pending' check (status in ('pending','payment_due','paid','cancelled')),
  due_date date,
  paid_at timestamptz,
  payment_approval_id uuid,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(transaction_id)
);

create table if not exists public.dkd_payment_approvals (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  requested_by uuid,
  approved_by uuid,
  amount numeric(12,2) not null default 0,
  period_start date,
  period_end date,
  payment_method text,
  receipt_url text,
  status text not null default 'pending' check (status in ('pending','approved','rejected','cancelled')),
  admin_note text,
  requested_at timestamptz not null default now(),
  approved_at timestamptz,
  rejected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- NOTE: Full migration was applied directly to Supabase with indexes, triggers, report view and RLS policies.
-- This file keeps the core v0.2 schema in GitHub for project tracking.
