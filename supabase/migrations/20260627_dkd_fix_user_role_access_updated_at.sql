alter table public.dkd_user_role_access add column if not exists updated_at timestamptz not null default now();

update public.dkd_user_role_access
set updated_at = now()
where updated_at is null;

create or replace function public.dkd_touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
