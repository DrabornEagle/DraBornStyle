-- Existing demo records are disabled by default; only Admin can opt in.
alter table db_style.db_style_demo_batches add column dkd_enabled boolean not null default false;

create function db_style.dkd_demo_visible(dkd_batch uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select dkd_batch is null or (auth.uid() is not null and db_style.db_style_is_admin() and exists(
  select 1 from db_style.db_style_demo_batches where id=dkd_batch and dkd_enabled and removed_at is null
 ))
$$;
create function db_style.dkd_business_visible(dkd_business uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select dkd_business is null or exists(select 1 from db_style.db_style_businesses where id=dkd_business and db_style.dkd_demo_visible(demo_batch_id))
$$;
create function db_style.dkd_require_business(dkd_business uuid) returns void
language plpgsql stable security invoker set search_path='' as $$ begin
 if not db_style.dkd_business_visible(dkd_business) then
  raise exception 'Bu işletme kullanılamıyor. Normal hesaplarda yalnızca gerçek işletmeler gösterilir.' using errcode='42501';
 end if;
end $$;
revoke all on function db_style.dkd_demo_visible(uuid),db_style.dkd_business_visible(uuid),db_style.dkd_require_business(uuid) from public;
grant execute on function db_style.dkd_demo_visible(uuid),db_style.dkd_business_visible(uuid),db_style.dkd_require_business(uuid) to anon,authenticated,service_role;

create or replace function db_style.db_style_can_manage(dkd_business uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select db_style.dkd_business_visible(dkd_business) and (db_style.db_style_is_admin() or exists(
  select 1 from db_style.db_style_business_members where business_id=dkd_business and user_id=auth.uid() and active and role in ('owner','manager')))
$$;
create or replace function db_style.db_style_can_staff(dkd_business uuid,dkd_staff uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select db_style.dkd_business_visible(dkd_business) and (db_style.db_style_can_manage(dkd_business) or exists(
  select 1 from db_style.db_style_business_members where business_id=dkd_business and staff_id=dkd_staff and user_id=auth.uid() and active))
$$;
create or replace function db_style.db_style_can_finance(dkd_business uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select db_style.dkd_business_visible(dkd_business) and (db_style.db_style_can_manage(dkd_business) or exists(
  select 1 from db_style.db_style_business_members where business_id=dkd_business and user_id=auth.uid() and active and can_view_finance))
$$;
create or replace function db_style.db_style_public_business(dkd_business uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from db_style.db_style_businesses where id=dkd_business and active and published and db_style.dkd_demo_visible(demo_batch_id))
$$;
create or replace function db_style.db_style_conversation_access(dkd_conversation uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from db_style.db_style_chat_conversations where id=dkd_conversation
  and db_style.dkd_business_visible(business_id) and (customer_user_id=auth.uid() or db_style.db_style_can_staff(business_id,staff_id)))
$$;

-- Restrictive policies preserve existing authorization and add demo isolation.
create policy dkd_real_or_admin_demo on db_style.db_style_businesses as restrictive for select to anon,authenticated
 using(db_style.dkd_demo_visible(demo_batch_id));
create policy dkd_enabled_demo on db_style.db_style_demo_batches as restrictive for select to authenticated using(dkd_enabled);
do $$ declare dkd_table text; begin
 for dkd_table in select c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='db_style' and c.relkind='r' and exists(
   select 1 from pg_attribute a where a.attrelid=c.oid and a.attname='business_id' and not a.attisdropped
  ) loop
  execute format('create policy dkd_real_or_admin_demo on db_style.%I as restrictive for select to anon,authenticated using(db_style.dkd_business_visible(business_id))',dkd_table);
 end loop;
end $$;

-- The quote and command RPCs use SECURITY DEFINER and need the same guard.
do $$ declare dkd_definition text; dkd_updated text; dkd_offset integer; begin
 select pg_get_functiondef('db_style.db_style_quote(uuid,uuid,uuid,uuid,text)'::regprocedure) into dkd_definition;
 dkd_updated:=replace(dkd_definition,'begin'||chr(10)||' select price_cents','begin'||chr(10)||' perform db_style.dkd_require_business(dkd_business);'||chr(10)||' select price_cents');
 if dkd_updated=dkd_definition then raise exception 'Quote guard anchor is missing'; end if;
 execute dkd_updated;
 select pg_get_functiondef('db_style.db_style_execute(text,jsonb,uuid)'::regprocedure) into dkd_definition;
 dkd_updated:=replace(dkd_definition,'''demo_load'',''demo_remove''','''demo_load'',''demo_remove'',''dkd_demo_disable''');
 if dkd_updated=dkd_definition then raise exception 'Demo command anchor is missing'; end if;
 dkd_offset:=strpos(dkd_updated,'begin'||chr(10));
 if dkd_offset=0 then raise exception 'Command body anchor is missing'; end if;
 dkd_updated:=left(dkd_updated,dkd_offset+5)
  ||chr(10)||' perform db_style.dkd_require_business(dkd_business);'||chr(10)
  ||regexp_replace(substr(dkd_updated,dkd_offset+6),'(dkd_business:=[^;]+;)',E'\\1\n perform db_style.dkd_require_business(dkd_business);','g');
 execute dkd_updated;
end $$;

-- Keep the validated demo loader/cleanup implementation and add the mode flag.
do $$ declare dkd_definition text; dkd_updated text; begin
 select pg_get_functiondef('db_style.db_style_demo(text,jsonb)'::regprocedure) into dkd_definition;
 dkd_updated:=replace(dkd_definition,'if dkd_action=''demo_load'' then',
  'if dkd_action=''dkd_demo_disable'' then'||chr(10)||
  ' update db_style.db_style_demo_batches set dkd_enabled=false where removed_at is null;'||chr(10)||
  ' return jsonb_build_object(''enabled'',false);'||chr(10)||
  'elsif dkd_action=''demo_load'' then'||chr(10)||
  ' update db_style.db_style_demo_batches set dkd_enabled=true where removed_at is null;');
 if dkd_updated=dkd_definition then raise exception 'Demo loader anchor is missing'; end if;
 dkd_definition:=dkd_updated;
 dkd_updated:=replace(dkd_definition,
  'insert into db_style.db_style_demo_batches(created_by) values(auth.uid())',
  'insert into db_style.db_style_demo_batches(created_by,dkd_enabled) values(auth.uid(),true)');
 if dkd_updated=dkd_definition then raise exception 'Demo batch anchor is missing'; end if;
 execute dkd_updated;
end $$;

notify pgrst,'reload schema';

