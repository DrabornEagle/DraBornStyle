create extension if not exists pgcrypto with schema extensions;

create type public.dkd_user_role as enum ('dkd_customer', 'dkd_business_owner', 'dkd_master', 'dkd_admin');
create type public.dkd_business_status as enum ('dkd_draft', 'dkd_pending_review', 'dkd_active', 'dkd_paused');
create type public.dkd_team_member_status as enum ('dkd_invited', 'dkd_active', 'dkd_paused', 'dkd_removed');
create type public.dkd_service_status as enum ('dkd_active', 'dkd_hidden', 'dkd_removed');
create type public.dkd_appointment_status as enum ('dkd_requested', 'dkd_confirmed', 'dkd_started', 'dkd_completed', 'dkd_cancelled');

create table public.dkd_user_profiles (
  dkd_id uuid primary key references auth.users(id) on delete cascade,
  dkd_role public.dkd_user_role not null default 'dkd_customer',
  dkd_display_name text not null default '',
  dkd_phone_number text,
  dkd_avatar_url text,
  dkd_is_onboarding_completed boolean not null default false,
  dkd_created_at timestamptz not null default now(),
  dkd_updated_at timestamptz not null default now()
);

create table public.dkd_business_profiles (
  dkd_id uuid primary key default gen_random_uuid(),
  dkd_owner_user_id uuid not null references auth.users(id) on delete cascade,
  dkd_business_name text not null,
  dkd_business_slug text not null unique,
  dkd_business_description text,
  dkd_phone_number text,
  dkd_address_text text,
  dkd_city_name text,
  dkd_district_name text,
  dkd_latitude numeric(10, 7),
  dkd_longitude numeric(10, 7),
  dkd_status public.dkd_business_status not null default 'dkd_draft',
  dkd_created_at timestamptz not null default now(),
  dkd_updated_at timestamptz not null default now(),
  constraint dkd_business_profiles_slug_format check (dkd_business_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table public.dkd_business_team_members (
  dkd_id uuid primary key default gen_random_uuid(),
  dkd_business_id uuid not null references public.dkd_business_profiles(dkd_id) on delete cascade,
  dkd_user_id uuid references auth.users(id) on delete set null,
  dkd_master_display_name text not null,
  dkd_master_bio text,
  dkd_master_phone_number text,
  dkd_role public.dkd_user_role not null default 'dkd_master',
  dkd_status public.dkd_team_member_status not null default 'dkd_active',
  dkd_sort_order integer not null default 0,
  dkd_created_at timestamptz not null default now(),
  dkd_updated_at timestamptz not null default now(),
  constraint dkd_business_team_members_role_allowed check (dkd_role in ('dkd_business_owner', 'dkd_master'))
);

create table public.dkd_business_services (
  dkd_id uuid primary key default gen_random_uuid(),
  dkd_business_id uuid not null references public.dkd_business_profiles(dkd_id) on delete cascade,
  dkd_service_name text not null,
  dkd_service_description text,
  dkd_base_price numeric(12, 2) not null default 0,
  dkd_duration_minutes integer not null default 30,
  dkd_status public.dkd_service_status not null default 'dkd_active',
  dkd_sort_order integer not null default 0,
  dkd_created_at timestamptz not null default now(),
  dkd_updated_at timestamptz not null default now(),
  constraint dkd_business_services_price_non_negative check (dkd_base_price >= 0),
  constraint dkd_business_services_duration_positive check (dkd_duration_minutes > 0)
);

create table public.dkd_appointments (
  dkd_id uuid primary key default gen_random_uuid(),
  dkd_customer_user_id uuid not null references auth.users(id) on delete cascade,
  dkd_business_id uuid not null references public.dkd_business_profiles(dkd_id) on delete cascade,
  dkd_team_member_id uuid references public.dkd_business_team_members(dkd_id) on delete set null,
  dkd_service_id uuid references public.dkd_business_services(dkd_id) on delete set null,
  dkd_appointment_start_at timestamptz not null,
  dkd_appointment_end_at timestamptz not null,
  dkd_status public.dkd_appointment_status not null default 'dkd_requested',
  dkd_customer_note text,
  dkd_business_note text,
  dkd_created_at timestamptz not null default now(),
  dkd_updated_at timestamptz not null default now(),
  constraint dkd_appointments_end_after_start check (dkd_appointment_end_at > dkd_appointment_start_at)
);

create index dkd_user_profiles_role_index on public.dkd_user_profiles(dkd_role);
create index dkd_business_profiles_owner_index on public.dkd_business_profiles(dkd_owner_user_id);
create index dkd_business_profiles_status_index on public.dkd_business_profiles(dkd_status);
create index dkd_business_team_members_business_index on public.dkd_business_team_members(dkd_business_id);
create index dkd_business_team_members_user_index on public.dkd_business_team_members(dkd_user_id);
create index dkd_business_services_business_index on public.dkd_business_services(dkd_business_id);
create index dkd_appointments_customer_index on public.dkd_appointments(dkd_customer_user_id);
create index dkd_appointments_business_index on public.dkd_appointments(dkd_business_id);
create index dkd_appointments_team_member_index on public.dkd_appointments(dkd_team_member_id);
create index dkd_appointments_start_index on public.dkd_appointments(dkd_appointment_start_at);
