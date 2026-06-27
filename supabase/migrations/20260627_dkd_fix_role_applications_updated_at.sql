alter table public.dkd_role_applications add column if not exists updated_at timestamptz not null default now();

update public.dkd_role_applications
set updated_at = now()
where updated_at is null;
