create schema if not exists dkd_private;

grant usage on schema dkd_private to authenticated;

create or replace function public.dkd_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.dkd_updated_at = now();
  return new;
end;
$$;

create or replace function dkd_private.dkd_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.dkd_user_profiles dkd_user_profile
    where dkd_user_profile.dkd_id = auth.uid()
      and dkd_user_profile.dkd_role = 'dkd_admin'
  );
$$;

create or replace function dkd_private.dkd_is_business_owner(dkd_business_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.dkd_business_profiles dkd_business_profile
    where dkd_business_profile.dkd_id = dkd_business_profile_id
      and dkd_business_profile.dkd_owner_user_id = auth.uid()
  );
$$;

create or replace function dkd_private.dkd_is_business_team_member(dkd_business_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.dkd_business_team_members dkd_team_member
    where dkd_team_member.dkd_business_id = dkd_business_profile_id
      and dkd_team_member.dkd_user_id = auth.uid()
      and dkd_team_member.dkd_status = 'dkd_active'
  );
$$;

create trigger dkd_user_profiles_updated_at_trigger before update on public.dkd_user_profiles for each row execute function public.dkd_set_updated_at();
create trigger dkd_business_profiles_updated_at_trigger before update on public.dkd_business_profiles for each row execute function public.dkd_set_updated_at();
create trigger dkd_business_team_members_updated_at_trigger before update on public.dkd_business_team_members for each row execute function public.dkd_set_updated_at();
create trigger dkd_business_services_updated_at_trigger before update on public.dkd_business_services for each row execute function public.dkd_set_updated_at();
create trigger dkd_appointments_updated_at_trigger before update on public.dkd_appointments for each row execute function public.dkd_set_updated_at();

alter table public.dkd_user_profiles enable row level security;
alter table public.dkd_business_profiles enable row level security;
alter table public.dkd_business_team_members enable row level security;
alter table public.dkd_business_services enable row level security;
alter table public.dkd_appointments enable row level security;

create policy dkd_user_profiles_select_policy on public.dkd_user_profiles for select to authenticated using (dkd_id = auth.uid() or dkd_private.dkd_is_admin());
create policy dkd_user_profiles_insert_policy on public.dkd_user_profiles for insert to authenticated with check (dkd_id = auth.uid());
create policy dkd_user_profiles_update_policy on public.dkd_user_profiles for update to authenticated using (dkd_id = auth.uid() or dkd_private.dkd_is_admin()) with check (dkd_id = auth.uid() or dkd_private.dkd_is_admin());

create policy dkd_business_profiles_select_policy on public.dkd_business_profiles for select to authenticated using (dkd_status = 'dkd_active' or dkd_owner_user_id = auth.uid() or dkd_private.dkd_is_admin() or dkd_private.dkd_is_business_team_member(dkd_id));
create policy dkd_business_profiles_insert_policy on public.dkd_business_profiles for insert to authenticated with check (dkd_owner_user_id = auth.uid() or dkd_private.dkd_is_admin());
create policy dkd_business_profiles_update_policy on public.dkd_business_profiles for update to authenticated using (dkd_owner_user_id = auth.uid() or dkd_private.dkd_is_admin()) with check (dkd_owner_user_id = auth.uid() or dkd_private.dkd_is_admin());

create policy dkd_business_team_members_select_policy on public.dkd_business_team_members for select to authenticated using (dkd_private.dkd_is_business_owner(dkd_business_id) or dkd_private.dkd_is_business_team_member(dkd_business_id) or dkd_private.dkd_is_admin());
create policy dkd_business_team_members_insert_policy on public.dkd_business_team_members for insert to authenticated with check (dkd_private.dkd_is_business_owner(dkd_business_id) or dkd_private.dkd_is_admin());
create policy dkd_business_team_members_update_policy on public.dkd_business_team_members for update to authenticated using (dkd_private.dkd_is_business_owner(dkd_business_id) or dkd_private.dkd_is_admin()) with check (dkd_private.dkd_is_business_owner(dkd_business_id) or dkd_private.dkd_is_admin());

create policy dkd_business_services_select_policy on public.dkd_business_services for select to authenticated using (dkd_status = 'dkd_active' or dkd_private.dkd_is_business_owner(dkd_business_id) or dkd_private.dkd_is_business_team_member(dkd_business_id) or dkd_private.dkd_is_admin());
create policy dkd_business_services_insert_policy on public.dkd_business_services for insert to authenticated with check (dkd_private.dkd_is_business_owner(dkd_business_id) or dkd_private.dkd_is_admin());
create policy dkd_business_services_update_policy on public.dkd_business_services for update to authenticated using (dkd_private.dkd_is_business_owner(dkd_business_id) or dkd_private.dkd_is_admin()) with check (dkd_private.dkd_is_business_owner(dkd_business_id) or dkd_private.dkd_is_admin());

create policy dkd_appointments_select_policy on public.dkd_appointments for select to authenticated using (dkd_customer_user_id = auth.uid() or dkd_private.dkd_is_business_owner(dkd_business_id) or dkd_private.dkd_is_business_team_member(dkd_business_id) or dkd_private.dkd_is_admin());
create policy dkd_appointments_insert_policy on public.dkd_appointments for insert to authenticated with check (dkd_customer_user_id = auth.uid() or dkd_private.dkd_is_admin());
create policy dkd_appointments_update_policy on public.dkd_appointments for update to authenticated using (dkd_customer_user_id = auth.uid() or dkd_private.dkd_is_business_owner(dkd_business_id) or dkd_private.dkd_is_business_team_member(dkd_business_id) or dkd_private.dkd_is_admin()) with check (dkd_customer_user_id = auth.uid() or dkd_private.dkd_is_business_owner(dkd_business_id) or dkd_private.dkd_is_business_team_member(dkd_business_id) or dkd_private.dkd_is_admin());
