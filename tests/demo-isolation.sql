-- No existing identity is impersonated. Synthetic users and app fixtures,
-- including notifications/audit events from commands, are rolled back.
begin;
do $$
declare
 dkd_admin uuid:=gen_random_uuid(); dkd_user uuid:=gen_random_uuid();
 dkd_real uuid; dkd_branch uuid; dkd_staff uuid; dkd_service uuid;
 dkd_demo uuid; dkd_demo_staff uuid; dkd_demo_service uuid;
 dkd_result jsonb; dkd_quote jsonb; dkd_at timestamptz;
 dkd_rejected boolean; dkd_original integer;
begin
 select count(*) into dkd_original from db_style.db_style_businesses where demo_batch_id is null;
 insert into auth.users(id,email,aud,role) values
  (dkd_admin,dkd_admin::text||'@example.invalid','authenticated','authenticated'),
  (dkd_user,dkd_user::text||'@example.invalid','authenticated','authenticated');
 insert into db_style.db_style_admin_users(user_id) values(dkd_admin);
 select id into dkd_demo from db_style.db_style_businesses where demo_batch_id is not null limit 1;
 select id into dkd_demo_staff from db_style.db_style_staff where business_id=dkd_demo and active limit 1;
 select service_id into dkd_demo_service from db_style.db_style_staff_services where staff_id=dkd_demo_staff limit 1;
 if dkd_demo is null then raise exception 'This integration fixture requires an existing disabled demo batch'; end if;

 perform set_config('request.jwt.claim.sub',dkd_admin::text,true);
 execute 'set local role authenticated';
 perform public.db_style_command('profile_save','{"name":"DKD test admin"}',gen_random_uuid());
 dkd_result:=public.db_style_command('business_create','{"name":"DKD real fixture","city":"Antalya","latitude":36.85,"longitude":30.74}',gen_random_uuid());
 dkd_real:=(dkd_result->>'id')::uuid; dkd_branch:=(dkd_result->>'branch_id')::uuid;
 dkd_result:=public.db_style_command('staff_save',jsonb_build_object('business_id',dkd_real,'name','DKD test usta'),gen_random_uuid());
 dkd_staff:=(dkd_result->>'id')::uuid;
 dkd_result:=public.db_style_command('service_save',jsonb_build_object('business_id',dkd_real,'name','Saç','duration_minutes',45,'price_cents',35000),gen_random_uuid());
 dkd_service:=(dkd_result->>'id')::uuid;
 dkd_at:=(((now() at time zone 'Europe/Istanbul')::date+1)+time '14:00') at time zone 'Europe/Istanbul';
 perform public.db_style_command('hours_save',jsonb_build_object('business_id',dkd_real,'weekday',extract(isodow from dkd_at at time zone 'Europe/Istanbul'),'open_minute',540,'close_minute',1320),gen_random_uuid());
 if exists(select 1 from db_style.db_style_businesses where demo_batch_id is not null) then raise exception 'Admin must opt in before reading demo records'; end if;
 if jsonb_array_length(public.db_style_query('bootstrap')->'demo_batches')<>0 then raise exception 'Disabled demo leaked into bootstrap'; end if;

 perform public.db_style_command('demo_load','{}',gen_random_uuid());
 if not exists(select 1 from db_style.db_style_businesses where id=dkd_demo) then raise exception 'Admin cannot see enabled demo'; end if;
 if not exists(select 1 from db_style.db_style_businesses where id=dkd_real) then raise exception 'Real business disappeared in demo mode'; end if;
 if jsonb_array_length(public.db_style_query('bootstrap')->'demo_batches')=0 then raise exception 'Enabled Admin demo missing from bootstrap'; end if;

 perform set_config('request.jwt.claim.sub',dkd_user::text,true);
 if exists(select 1 from db_style.db_style_businesses where demo_batch_id is not null) then raise exception 'Normal user can read enabled demo'; end if;
 if jsonb_array_length(public.db_style_query('directory'))<>dkd_original+1 then raise exception 'Normal directory is not organic'; end if;
 if jsonb_array_length(public.db_style_query('bootstrap')->'demo_batches')<>0 then raise exception 'Normal bootstrap contains demo'; end if;
 if exists(select 1 from db_style.db_style_staff where business_id=dkd_demo) then raise exception 'Direct staff query leaks demo'; end if;
 if exists(select 1 from db_style.db_style_appointments where business_id=dkd_demo) then raise exception 'Direct appointment query leaks demo'; end if;
 dkd_rejected:=false; begin
  perform public.db_style_command('demo_load','{}',gen_random_uuid());
 exception when others then dkd_rejected:=true; end;
 if not dkd_rejected then raise exception 'Normal account can enable demo'; end if;
 dkd_rejected:=false; begin
  perform public.db_style_command('dkd_demo_disable','{}',gen_random_uuid());
 exception when others then dkd_rejected:=true; end;
 if not dkd_rejected then raise exception 'Normal account can disable demo'; end if;
 dkd_rejected:=false; begin
  perform public.db_style_quote(dkd_demo,dkd_demo_staff,dkd_demo_service,null);
 exception when insufficient_privilege then dkd_rejected:=true; end;
 if not dkd_rejected then raise exception 'Direct quote bypasses demo isolation'; end if;
 dkd_rejected:=false; begin
  perform public.db_style_command('book',jsonb_build_object('business_id',dkd_demo,'staff_id',dkd_demo_staff,'service_id',dkd_demo_service,'starts_at',dkd_at),gen_random_uuid());
 exception when insufficient_privilege then dkd_rejected:=true; end;
 if not dkd_rejected then raise exception 'Direct booking bypasses demo isolation'; end if;
 dkd_rejected:=false; begin
  perform public.db_style_slots(dkd_demo_staff,dkd_demo_service,(dkd_at at time zone 'Europe/Istanbul')::date);
 exception when others then dkd_rejected:=true; end;
 if not dkd_rejected then raise exception 'Direct slots bypasses demo isolation'; end if;

 -- Real customer flow still creates an organic booking while Admin demo is on.
 perform public.db_style_command('profile_save','{"name":"DKD real customer"}',gen_random_uuid());
 dkd_quote:=public.db_style_quote(dkd_real,dkd_staff,dkd_service,null);
 if (dkd_quote->>'total_cents')::bigint<>37000 then raise exception 'Real quote changed'; end if;
 dkd_result:=public.db_style_command('book',jsonb_build_object('business_id',dkd_real,'staff_id',dkd_staff,'service_id',dkd_service,'starts_at',dkd_at,'expected_service_cents',35000,'expected_fee_cents',2000),gen_random_uuid());
 if not exists(select 1 from db_style.db_style_appointments where id=(dkd_result->>'id')::uuid and customer_user_id=dkd_user and business_id=dkd_real) then raise exception 'Organic booking failed'; end if;
 dkd_rejected:=false; begin
  perform public.db_style_command('location_update',jsonb_build_object('id',dkd_result->>'id','shared',true,'grant_consent',true,'latitude',36.85,'longitude',30.74),gen_random_uuid());
 exception when others then dkd_rejected:=true; end;
 if not dkd_rejected then raise exception 'Location time window was removed'; end if;

 perform set_config('request.jwt.claim.sub','',true);
 execute 'set local role anon';
 if exists(select 1 from db_style.db_style_businesses where demo_batch_id is not null) then raise exception 'Guest can read enabled demo'; end if;
 if jsonb_array_length(public.db_style_query('directory'))<>dkd_original+1 then raise exception 'Guest directory is not organic'; end if;
 execute 'set local role authenticated';
 perform set_config('request.jwt.claim.sub',dkd_admin::text,true);
 perform public.db_style_command('dkd_demo_disable','{}',gen_random_uuid());
 if exists(select 1 from db_style.db_style_businesses where demo_batch_id is not null) then raise exception 'Admin demo did not close'; end if;
 if not exists(select 1 from db_style.db_style_businesses where id=dkd_real) then raise exception 'Closing demo changed a real business'; end if;
 execute 'set local role postgres';
end $$;
rollback;
select 'passed: demo isolation, Admin opt-in, guest access, direct RPC guards and organic booking; all fixtures rolled back' as result;
