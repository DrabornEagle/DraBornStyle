-- Run on the target database. All fixtures and test changes roll back.
-- No Auth user or other application's record is created, updated or deleted.
begin;
create function pg_temp.db_style_assert(dkd_ok boolean,dkd_label text) returns void language plpgsql as $$begin
 if dkd_ok is distinct from true then raise exception 'TEST FAILED: %',dkd_label; end if;
end $$;
do $$
declare dkd_admin uuid; dkd_customer_user uuid; dkd_staff_user uuid; dkd_business uuid; dkd_other_business uuid; dkd_staff uuid; dkd_other_staff uuid; dkd_service uuid;
 dkd_customer uuid; dkd_branch uuid; dkd_appt uuid; dkd_session uuid; dkd_walkin uuid; dkd_claim uuid; dkd_period uuid; dkd_conversation uuid; dkd_request uuid; dkd_loc uuid; dkd_held uuid; dkd_batch uuid;
 dkd_key uuid:=gen_random_uuid(); dkd_result jsonb; dkd_first jsonb; dkd_quote jsonb; dkd_at timestamptz; dkd_after timestamptz; dkd_waitlist uuid; dkd_cents bigint; dkd_error boolean; dkd_count int; dkd_grain text;
begin
 select user_id into dkd_admin from db_style.db_style_admin_users where active limit 1;
 select id into dkd_customer_user from auth.users where id<>dkd_admin order by created_at limit 1;
 select id into dkd_staff_user from auth.users where id not in(dkd_admin,dkd_customer_user) order by created_at limit 1;
 perform pg_temp.db_style_assert(dkd_admin is not null and dkd_customer_user is not null and dkd_staff_user is not null,'At least three existing Auth identities');
 perform set_config('request.jwt.claim.sub',dkd_admin::text,true);
 execute 'set local role authenticated';
 perform public.db_style_command('profile_save','{"name":"DB test admin"}',gen_random_uuid());
 dkd_result:=public.db_style_command('business_create','{"name":"DB TEST ONLY","address":"Test","city":"Antalya"}',gen_random_uuid());dkd_business:=(dkd_result->>'id')::uuid;dkd_branch:=(dkd_result->>'branch_id')::uuid;
 dkd_result:=public.db_style_command('staff_save',jsonb_build_object('business_id',dkd_business,'name','Test Usta'),gen_random_uuid());dkd_staff:=(dkd_result->>'id')::uuid;
 dkd_result:=public.db_style_command('staff_save',jsonb_build_object('business_id',dkd_business,'name','İkinci Usta'),gen_random_uuid());dkd_other_staff:=(dkd_result->>'id')::uuid;
 dkd_result:=public.db_style_command('service_save',jsonb_build_object('business_id',dkd_business,'name','Saç','duration_minutes',45,'price_cents',35000),gen_random_uuid());dkd_service:=(dkd_result->>'id')::uuid;
 dkd_at:=(((now() at time zone 'Europe/Istanbul')::date+1)+time '14:00') at time zone 'Europe/Istanbul';
 perform public.db_style_command('hours_save',jsonb_build_object('business_id',dkd_business,'weekday',extract(isodow from (dkd_at at time zone 'Europe/Istanbul')),'open_minute',540,'close_minute',1320),gen_random_uuid());
 perform public.db_style_command('promo_save',jsonb_build_object('business_id',dkd_business,'staff_id',dkd_staff,'code','DB_TEST_15','discount_bps',1500),gen_random_uuid());
 dkd_quote:=public.db_style_quote(dkd_business,dkd_staff,dkd_service,'DB_TEST_15');
 perform pg_temp.db_style_assert((dkd_quote->>'total_cents')::bigint=31750,'15% discount + separate 20 TL fee = 317.50 TL');
 dkd_error:=false;begin perform public.db_style_quote(dkd_business,dkd_other_staff,dkd_service,'DB_TEST_15');exception when others then dkd_error:=true;end;
 perform pg_temp.db_style_assert(dkd_error,'Promo cannot move to a different staff');
 -- Associate one existing Auth identity with this test staff; test tables only.
 execute 'set local role postgres';
 insert into db_style.db_style_business_members(business_id,user_id,role,staff_id) values(dkd_business,dkd_staff_user,'staff',dkd_staff);
 execute 'set local role authenticated';
 perform set_config('request.jwt.claim.sub',dkd_customer_user::text,true);
 perform public.db_style_command('profile_save','{"name":"Test Customer"}',gen_random_uuid());
 dkd_error:=false;begin perform public.db_style_command('book',jsonb_build_object('business_id',dkd_business,'staff_id',dkd_staff,'service_id',dkd_service,'starts_at',dkd_at,'expected_service_cents',1),gen_random_uuid());exception when others then dkd_error:=true;end;
 perform pg_temp.db_style_assert(dkd_error,'Stale displayed price requires explicit reapproval');
 dkd_first:=public.db_style_command('book',jsonb_build_object('business_id',dkd_business,'staff_id',dkd_staff,'service_id',dkd_service,'starts_at',dkd_at,'code','DB_TEST_15'),dkd_key);dkd_appt:=(dkd_first->>'id')::uuid;
 dkd_result:=public.db_style_command('book',jsonb_build_object('business_id',dkd_business,'staff_id',dkd_staff,'service_id',dkd_service,'starts_at',dkd_at,'code','DB_TEST_15'),dkd_key);
 perform pg_temp.db_style_assert(dkd_first=dkd_result,'Reconnect/idempotent duplicate returns original appointment');
 select count(*) into dkd_count from db_style.db_style_appointments where id=dkd_appt;
 perform pg_temp.db_style_assert(dkd_count=1,'Only one appointment created');
 dkd_error:=false;begin perform public.db_style_command('book',jsonb_build_object('business_id',dkd_business,'staff_id',dkd_staff,'service_id',dkd_service,'starts_at',dkd_at),gen_random_uuid());exception when others then dkd_error:=true;end;
 perform pg_temp.db_style_assert(dkd_error,'Overlapping booking prevented by API');
 -- The database guard works independently of the UI or RPC.
 execute 'set local role postgres';dkd_error:=false;begin
  insert into db_style.db_style_calendar_entries(business_id,staff_id,starts_at,ends_at,kind) values(dkd_business,dkd_staff,dkd_at+interval '15 minutes',dkd_at+interval '1 hour','appointment');
 exception when exclusion_violation then dkd_error:=true;end;
 perform pg_temp.db_style_assert(dkd_error,'PostgreSQL exclusion constraint rejects direct overlaps');execute 'set local role authenticated';
 dkd_result:=public.db_style_command('waitlist_join',jsonb_build_object('business_id',dkd_business,'staff_id',dkd_staff,'service_id',dkd_service,'starts_at',dkd_at,'ends_at',dkd_at+interval '2 hours'),gen_random_uuid());dkd_waitlist:=(dkd_result->>'id')::uuid;
 perform public.db_style_command('cancel',jsonb_build_object('id',dkd_appt),gen_random_uuid());
 perform pg_temp.db_style_assert(exists(select 1 from db_style.db_style_notifications where user_id=dkd_customer_user and reference_id=dkd_waitlist),'Cancellation creates waitlist notification');
 dkd_result:=public.db_style_command('book',jsonb_build_object('business_id',dkd_business,'staff_id',dkd_staff,'service_id',dkd_service,'starts_at',dkd_at,'code','DB_TEST_15'),gen_random_uuid());dkd_appt:=(dkd_result->>'id')::uuid;
 perform pg_temp.db_style_assert(not exists(select 1 from db_style.db_style_platform_fee_ledger where business_id=dkd_business),'No fee for cancelled/noncompleted appointments');
 dkd_result:=public.db_style_command('chat_open',jsonb_build_object('appointment_id',dkd_appt),gen_random_uuid());dkd_conversation:=(dkd_result->>'id')::uuid;
 perform public.db_style_command('message_send',jsonb_build_object('id',dkd_conversation,'body','15 dakika gecikebilirim.'),gen_random_uuid());
 perform set_config('request.jwt.claim.sub',dkd_staff_user::text,true);
 perform pg_temp.db_style_assert(exists(select 1 from db_style.db_style_chat_messages where conversation_id=dkd_conversation),'Staff reads own conversation');
 perform public.db_style_command('chat_read',jsonb_build_object('id',dkd_conversation),gen_random_uuid());
 perform public.db_style_command('staff_status',jsonb_build_object('business_id',dkd_business,'staff_id',dkd_staff,'status','busy','return_at',now()+interval '30 minutes'),gen_random_uuid());
 perform pg_temp.db_style_assert(exists(select 1 from db_style.db_style_appointments where id=dkd_appt and status='booked'),'Temporary busy preserves appointments');
 perform public.db_style_command('staff_status',jsonb_build_object('business_id',dkd_business,'staff_id',dkd_staff,'status','available'),gen_random_uuid());
 dkd_result:=public.db_style_command('start_session',jsonb_build_object('appointment_id',dkd_appt),gen_random_uuid());dkd_session:=(dkd_result->>'id')::uuid;
 dkd_error:=false;begin perform public.db_style_command('finish_session',jsonb_build_object('id',dkd_session,'service_cents',30000,'reason','Test price change'),gen_random_uuid());exception when others then dkd_error:=true;end;
 perform pg_temp.db_style_assert(dkd_error,'Staff cannot change price without permission');
 perform public.db_style_command('finish_session',jsonb_build_object('id',dkd_session,'paid',true,'payment_method','cash'),gen_random_uuid());
 perform public.db_style_command('finish_session',jsonb_build_object('id',dkd_session,'paid',true),gen_random_uuid());
 execute 'set local role postgres';
 perform pg_temp.db_style_assert((select count(*) from db_style.db_style_platform_fee_ledger where session_id=dkd_session)=1,'Repeated finish cannot create a second fee');
 perform pg_temp.db_style_assert((select total_cents from db_style.db_style_service_sessions where id=dkd_session)=31750,'Completed appointment uses price snapshot');
 execute 'set local role authenticated';perform set_config('request.jwt.claim.sub',dkd_admin::text,true);
 -- Every walk-in owes a fee too, with business-specific rule and final price correction.
 perform public.db_style_command('fee_rule',jsonb_build_object('business_id',dkd_business,'fee_cents',2500),gen_random_uuid());
 dkd_result:=public.db_style_command('start_session',jsonb_build_object('business_id',dkd_business,'staff_id',dkd_staff,'service_id',dkd_service,'customer_name','Walk-in Guest'),gen_random_uuid());dkd_walkin:=(dkd_result->>'id')::uuid;
 perform public.db_style_command('finish_session',jsonb_build_object('id',dkd_walkin,'service_cents',30000,'reason','Özel müşteri fiyatı','paid',true,'payment_method','cash'),gen_random_uuid());
 perform pg_temp.db_style_assert((select total_cents from db_style.db_style_service_sessions where id=dkd_walkin)=32500,'Walk-in final price + business fee = 325 TL');
 perform pg_temp.db_style_assert((select fee_cents from db_style.db_style_service_sessions where id=dkd_session)=2000,'New fee rule does not change old session');
 select period_id into dkd_period from db_style.db_style_platform_fee_ledger where session_id=dkd_walkin;
 dkd_result:=public.db_style_command('payment_claim',jsonb_build_object('business_id',dkd_business,'period_id',dkd_period,'amount_cents',1000,'method','transfer','paid_at',now()),gen_random_uuid());dkd_claim:=(dkd_result->>'id')::uuid;
 select balance_cents into dkd_cents from db_style.db_style_business_balances where business_id=dkd_business;
 perform pg_temp.db_style_assert(dkd_cents=4500,'Claim alone does not reduce 45 TL liability');
 perform set_config('request.jwt.claim.sub',dkd_staff_user::text,true);dkd_error:=false;begin perform public.db_style_command('payment_approve',jsonb_build_object('id',dkd_claim),gen_random_uuid());exception when others then dkd_error:=true;end;
 perform pg_temp.db_style_assert(dkd_error,'Non-admin cannot approve platform payment');
 perform set_config('request.jwt.claim.sub',dkd_admin::text,true);
 perform public.db_style_command('payment_approve',jsonb_build_object('id',dkd_claim),gen_random_uuid());
 perform pg_temp.db_style_assert((select balance_cents from db_style.db_style_business_balances where business_id=dkd_business)=3500,'Approved 10 TL partial payment leaves 35 TL');
 dkd_error:=false;begin perform public.db_style_command('payment_approve',jsonb_build_object('id',dkd_claim),gen_random_uuid());exception when others then dkd_error:=true;end;
 perform pg_temp.db_style_assert(dkd_error,'Duplicate payment approval prevented');
 dkd_result:=public.db_style_command('payment_claim',jsonb_build_object('business_id',dkd_business,'period_id',dkd_period,'amount_cents',500,'method','cash','paid_at',now()),gen_random_uuid());
 perform public.db_style_command('payment_reject',jsonb_build_object('id',dkd_result->>'id','reason','Banka hareketi bulunamadı'),gen_random_uuid());
 perform pg_temp.db_style_assert((select balance_cents from db_style.db_style_business_balances where business_id=dkd_business)=3500,'Rejected claim leaves balance intact');
 dkd_result:=public.db_style_query('stats',jsonb_build_object('business_id',dkd_business));
 perform pg_temp.db_style_assert((dkd_result->>'completed')::int=2 and (dkd_result->>'service_cents')::bigint=59750,'Reports use actual completed sessions and prices');
 for dkd_grain in select unnest(array['day','week','month']) loop
  dkd_result:=public.db_style_query('stats',jsonb_build_object('business_id',dkd_business,'from',date_trunc(dkd_grain,now() at time zone 'Europe/Istanbul') at time zone 'Europe/Istanbul','to',now()+interval '1 day'));
  perform pg_temp.db_style_assert((dkd_result->>'completed')::int=2 and (dkd_result->>'service_cents')::bigint=59750 and (dkd_result->>'fee_cents')::bigint=4500 and (dkd_result->>'collected_cents')::bigint=1000,'Daily/weekly/monthly report includes only verified collection: '||dkd_grain);
 end loop;
 dkd_result:=public.db_style_query('stats',jsonb_build_object('business_id',dkd_business,'from',now()+interval '1 day','to',now()+interval '2 days'));
 perform pg_temp.db_style_assert((dkd_result->>'completed')::int=0 and (dkd_result->>'service_cents')::bigint=0 and (dkd_result->>'fee_cents')::bigint=0,'Date filter excludes completed transactions outside range');
 perform public.db_style_command('reverse_session',jsonb_build_object('id',dkd_walkin,'reason','Test reversal'),gen_random_uuid());
 perform pg_temp.db_style_assert((select balance_cents from db_style.db_style_business_balances where business_id=dkd_business)=1000,'Reversal subtracts fee without deleting ledger');
 dkd_error:=false;begin update db_style.db_style_platform_fee_ledger set amount_cents=0 where business_id=dkd_business;exception when insufficient_privilege then dkd_error:=true;end;
 perform pg_temp.db_style_assert(dkd_error,'Authenticated user cannot edit ledger directly');
 -- An unrelated customer cannot see customer list, financial claims, notes or locations.
 dkd_result:=public.db_style_command('business_create','{"name":"ISOLATION SECOND BUSINESS"}',gen_random_uuid());dkd_other_business:=(dkd_result->>'id')::uuid;
 perform set_config('request.jwt.claim.sub',dkd_customer_user::text,true);
 perform pg_temp.db_style_assert(not db_style.db_style_is_admin(),'Admin role is not derived from email or editable metadata');
 perform pg_temp.db_style_assert((select count(*) from db_style.db_style_payment_claims where business_id=dkd_business)=0,'Customer cannot read business financial claims');
 perform pg_temp.db_style_assert((select count(*) from db_style.db_style_customers where business_id=dkd_other_business)=0,'Customer cannot read other tenant customer records');
 dkd_error:=false;begin perform public.db_style_command('staff_save',jsonb_build_object('business_id',dkd_other_business,'name','Unauthorized'),gen_random_uuid());exception when others then dkd_error:=true;end;
 perform pg_temp.db_style_assert(dkd_error,'Cross-tenant mutation denied');
 dkd_error:=false;begin perform public.db_style_command('location_update',jsonb_build_object('id',dkd_appt,'shared',true,'latitude',36.85,'longitude',30.74),gen_random_uuid());exception when others then dkd_error:=true;end;
 perform pg_temp.db_style_assert(dkd_error,'Location cannot be shared for finished appointment');
 perform pg_temp.db_style_assert(exists(select 1 from db_style.db_style_appointments where id=dkd_appt and status='completed'),'Appointments work without location permission');
 -- Extra-hour hold is reserved before customer confirmation, even outside regular hours.
 perform set_config('request.jwt.claim.sub',dkd_customer_user::text,true);
 dkd_result:=public.db_style_command('extra_request',jsonb_build_object('business_id',dkd_business,'staff_id',dkd_staff,'service_id',dkd_service,'starts_at',dkd_at+interval '9 hours','message','Ekstra saat testi'),gen_random_uuid());dkd_request:=(dkd_result->>'id')::uuid;
 perform set_config('request.jwt.claim.sub',dkd_staff_user::text,true);
 perform public.db_style_command('extra_offer',jsonb_build_object('id',dkd_request,'starts_at',dkd_at+interval '9 hours'),gen_random_uuid());
 perform pg_temp.db_style_assert(exists(select 1 from db_style.db_style_calendar_entries where reference_id=dkd_request and active and kind='hold'),'Extra offer holds the slot');
 perform set_config('request.jwt.claim.sub',dkd_customer_user::text,true);
 dkd_result:=public.db_style_command('extra_accept',jsonb_build_object('id',dkd_request),gen_random_uuid());dkd_held:=(dkd_result->>'id')::uuid;
 perform pg_temp.db_style_assert(exists(select 1 from db_style.db_style_appointments where id=dkd_held and status='booked'),'Customer confirmation turns hold into appointment');
 -- Set up a nearby appointment in this rollback-only fixture for location permission tests.
 execute 'set local role postgres';
 update db_style.db_style_appointments set starts_at=now()+interval '30 minutes',ends_at=now()+interval '75 minutes' where id=dkd_held;
 update db_style.db_style_calendar_entries set starts_at=now()+interval '30 minutes',ends_at=now()+interval '75 minutes' where reference_id=dkd_held;
 execute 'set local role authenticated';
 dkd_error:=false;begin perform public.db_style_command('location_update',jsonb_build_object('id',dkd_held,'shared',true,'latitude',36.85,'longitude',30.74),gen_random_uuid());exception when others then dkd_error:=true;end;
 perform pg_temp.db_style_assert(dkd_error,'GPS updates without explicit initial consent are rejected');
 perform public.db_style_command('location_update',jsonb_build_object('id',dkd_held,'shared',true,'grant_consent',true,'latitude',36.85,'longitude',30.74,'eta_minutes',10),gen_random_uuid());
 perform set_config('request.jwt.claim.sub',dkd_staff_user::text,true);
 perform pg_temp.db_style_assert(exists(select 1 from db_style.db_style_appointment_locations where appointment_id=dkd_held and shared),'Assigned staff sees consented location');
 perform set_config('request.jwt.claim.sub',dkd_customer_user::text,true);
 perform public.db_style_command('location_update',jsonb_build_object('id',dkd_held,'shared',false),gen_random_uuid());
 dkd_error:=false;begin perform public.db_style_command('location_update',jsonb_build_object('id',dkd_held,'shared',true,'latitude',36.85,'longitude',30.74),gen_random_uuid());exception when others then dkd_error:=true;end;
 perform pg_temp.db_style_assert(dkd_error,'Late GPS update cannot restore revoked consent');
 perform set_config('request.jwt.claim.sub',dkd_staff_user::text,true);
 perform pg_temp.db_style_assert(not exists(select 1 from db_style.db_style_appointment_locations where appointment_id=dkd_held),'Revoked location is hidden from staff');
 -- Employee access is revoked on deactivation and account lookup stays scoped.
 perform set_config('request.jwt.claim.sub',dkd_admin::text,true);
 perform public.db_style_command('staff_save',jsonb_build_object('business_id',dkd_business,'staff_id',dkd_staff,'active',false),gen_random_uuid());
 perform set_config('request.jwt.claim.sub',dkd_staff_user::text,true);
 perform pg_temp.db_style_assert(not exists(select 1 from db_style.db_style_appointments where id=dkd_held),'Inactive employee no longer sees appointment');
 dkd_error:=false;begin perform db_style.db_style_staff_accounts(dkd_business);exception when others then dkd_error:=true;end;
 perform pg_temp.db_style_assert(dkd_error,'Employee cannot query business account emails');
 perform set_config('request.jwt.claim.sub',dkd_admin::text,true);
 perform public.db_style_command('staff_save',jsonb_build_object('business_id',dkd_business,'staff_id',dkd_staff,'active',true),gen_random_uuid());
 -- Due notifications are generated once per period/user/day, never on each cron tick.
 execute 'set local role postgres';
 update db_style.db_style_payment_periods set due_at=now()-interval '1 day' where id=dkd_period;
 perform db_style.db_style_tick();
 select count(*) into dkd_count from db_style.db_style_notifications where reference_id=dkd_period and kind='payment_due';
 perform db_style.db_style_tick();
 perform pg_temp.db_style_assert(dkd_count>0 and dkd_count=(select count(*) from db_style.db_style_notifications where reference_id=dkd_period and kind='payment_due'),'Due reminders are deduplicated');
 execute 'set local role authenticated';
 dkd_result:=public.db_style_query('stats',jsonb_build_object('business_id',dkd_business,'service_id',dkd_service,'period','month'));
 perform pg_temp.db_style_assert((dkd_result->>'service_cents')::bigint=29750 and (dkd_result->>'fee_cents')::bigint=2000,'Reversal records net service and fee movement correctly');
 perform pg_temp.db_style_assert((dkd_result->'daily'->0->>'fee_cents') is not null,'Chart includes monetary fee data');
 -- Private data API schema is not exposed; public privileged wrappers are invoker-only.
 execute 'set local role postgres';
 perform pg_temp.db_style_assert(not exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and proname like 'db_style_%' and prosecdef),'No exposed SECURITY DEFINER entrypoints');
 perform pg_temp.db_style_assert((select count(*) from pg_tables where schemaname='db_style' and not rowsecurity)=0,'RLS enabled on every Style table');
 perform pg_temp.db_style_assert(not has_function_privilege('anon','public.db_style_command(text,jsonb,uuid)','execute'),'Anonymous command endpoint denied');
 -- Demo deletion is exercised under rollback, preserving current demo fixture.
 perform set_config('request.jwt.claim.sub',dkd_admin::text,true);
 perform public.db_style_command('demo_remove','{}',gen_random_uuid());
 perform pg_temp.db_style_assert(not exists(select 1 from db_style.db_style_businesses where demo_batch_id is not null),'Demo removal deletes only demo businesses');
 perform pg_temp.db_style_assert(exists(select 1 from db_style.db_style_businesses where id=dkd_business),'Demo removal preserves non-demo businesses');
end $$;
select 'PASS: database transactions, fees, partial payments, permissions, demo deletion (rolled back)' as test_result;
rollback;
