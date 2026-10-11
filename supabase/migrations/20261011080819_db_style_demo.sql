-- Demo data is clearly marked. It never creates/deletes shared Auth users.
create function db_style.db_style_demo(dkd_action text,dkd_payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare dkd_batch uuid; dkd_business uuid; dkd_branch uuid; dkd_staff uuid; dkd_staff2 uuid; dkd_service uuid; dkd_customer uuid; dkd_session uuid; dkd_period uuid; dkd_claim uuid; dkd_receipt uuid;
 dkd_n int; dkd_i int; dkd_name text; dkd_image text; dkd_price bigint; dkd_start timestamptz; dkd_end timestamptz; dkd_appointment uuid; dkd_t record; dkd_staff_ids uuid[]; dkd_result jsonb; begin
 if not db_style.db_style_is_admin() then raise exception 'Demo yönetimi Admin yetkisi gerektirir.'; end if;
 perform pg_advisory_xact_lock(hashtextextended('db_style_demo',0));
 if dkd_action='demo_load' then
  select id into dkd_batch from db_style.db_style_demo_batches where removed_at is null limit 1;
  if dkd_batch is not null then return jsonb_build_object('id',dkd_batch,'already_loaded',true); end if;
  insert into db_style.db_style_demo_batches(created_by) values(auth.uid()) returning id into dkd_batch;
  for dkd_n in 1..3 loop
   dkd_name:=case dkd_n when 1 then 'Ahmet Berber' when 2 then 'Miami Kuaför' else 'Elite Barber' end;
   dkd_image:=case dkd_n when 1 then 'asset:barber' when 2 then 'asset:salon' else 'asset:elite' end;
   insert into db_style.db_style_businesses(name,description,address,city,phone,latitude,longitude,cover_url,logo_url,demo_batch_id)
    values(dkd_name,'Neon ışıkların altında tarzını yenile. Saç, sakal ve bakım için uzman ustalar.','Lara Caddesi, Muratpaşa, Antalya','Antalya','',36.850+dkd_n*0.009,30.740+dkd_n*0.004,dkd_image,dkd_image,dkd_batch) returning id into dkd_business;
   insert into db_style.db_style_branches(business_id,address,latitude,longitude) select id,address,latitude,longitude from db_style.db_style_businesses where id=dkd_business returning id into dkd_branch;
   insert into db_style.db_style_business_members(business_id,user_id,role,can_edit_prices,can_view_finance,can_manage_services) values(dkd_business,auth.uid(),'owner',true,true,true);
   insert into db_style.db_style_working_hours(business_id,branch_id,weekday,open_minute,close_minute) select dkd_business,dkd_branch,n,540,1320 from generate_series(1,7)n;
   insert into db_style.db_style_payment_plans(business_id,cadence,day_number,approved,approved_by) values(dkd_business,case when dkd_n=1 then 'weekly' else 'monthly' end,1,true,auth.uid());
   insert into db_style.db_style_platform_fee_rules(business_id,fee_cents,created_by) values(dkd_business,2000,auth.uid());
   dkd_staff_ids:='{}';
   for dkd_i in 1..3 loop
    insert into db_style.db_style_staff(business_id,branch_id,name,photo_url,specialties,target_monthly)
    values(dkd_business,dkd_branch,case dkd_i when 1 then 'Ahmet Usta' when 2 then 'Mehmet Usta' else 'Ali Usta' end,case dkd_i when 1 then 'asset:ahmet' when 2 then 'asset:mehmet' else 'asset:ali' end,case dkd_i when 2 then 'Modern kesim • Fade • Sakal' else 'Saç tasarımı • Bakım' end,150) returning id into dkd_staff;
    dkd_staff_ids:=array_append(dkd_staff_ids,dkd_staff);
    insert into db_style.db_style_staff_status(staff_id,business_id) values(dkd_staff,dkd_business);
   end loop;
   for dkd_i in 1..4 loop
    dkd_price:=case dkd_i when 1 then 35000 when 2 then 20000 when 3 then 50000 else 25000 end;
    insert into db_style.db_style_services(business_id,name,duration_minutes,price_cents) values(dkd_business,case dkd_i when 1 then 'Saç Tıraşı' when 2 then 'Sakal Tıraşı' when 3 then 'Saç + Sakal' else 'Çocuk Tıraşı' end,case dkd_i when 1 then 45 when 2 then 30 when 3 then 60 else 30 end,dkd_price) returning id into dkd_service;
    insert into db_style.db_style_staff_services(business_id,staff_id,service_id) select dkd_business,unnest(dkd_staff_ids),dkd_service;
   end loop;
   select id into dkd_service from db_style.db_style_services where business_id=dkd_business and name='Saç Tıraşı';
   insert into db_style.db_style_customers(business_id,user_id,name,preferences_consent,favorite_staff_id) values(dkd_business,auth.uid(),'Demo Müşteri',true,dkd_staff_ids[2]) returning id into dkd_customer;
   insert into db_style.db_style_promo_codes(business_id,staff_id,code,discount_bps) values(dkd_business,dkd_staff_ids[2],'MEHMET15'||case when dkd_n=1 then '' else dkd_n::text end,1500);
   -- Historical completed sessions and their exact fee ledger, all marked via business/demo batch.
   for dkd_i in 1..12 loop
    dkd_staff:=dkd_staff_ids[1+(dkd_i%3)];
    dkd_end:=now()-make_interval(days=>dkd_i%5,hours=>dkd_i%4,mins=>dkd_i*3);
    dkd_start:=dkd_end-interval '42 minutes';
    dkd_period:=db_style.db_style_period(dkd_business,dkd_end);
    insert into db_style.db_style_service_sessions(business_id,branch_id,staff_id,service_id,customer_id,source,started_at,expected_end_at,completed_at,state,normal_price_cents,quoted_service_cents,quoted_fee_cents,service_cents,fee_cents,total_cents,service_payment_status,service_payment_method)
     values(dkd_business,dkd_branch,dkd_staff,dkd_service,dkd_customer,case when dkd_i%2=0 then 'demo' else 'walkin' end,dkd_start,dkd_end,dkd_end,'completed',35000,35000,2000,35000,2000,37000,'paid','cash') returning id into dkd_session;
    insert into db_style.db_style_platform_fee_ledger(business_id,session_id,period_id,amount_cents,kind,created_at) values(dkd_business,dkd_session,dkd_period,2000,'charge',dkd_end);
    insert into db_style.db_style_service_payment_events(business_id,session_id,amount_cents,method,created_at) values(dkd_business,dkd_session,37000,'cash',dkd_end);
   end loop;
   dkd_period:=db_style.db_style_period(dkd_business,now());
   if dkd_n=2 then
    insert into db_style.db_style_payment_claims(business_id,period_id,amount_cents,method,paid_at,submitted_by,explanation) values(dkd_business,dkd_period,4000,'transfer',now(),auth.uid(),'DEMO: kısmi ödeme bildirimi') returning id into dkd_claim;
   end if;
   dkd_staff:=dkd_staff_ids[2];
   dkd_start:=((now() at time zone 'Europe/Istanbul')::date+1+time '14:00') at time zone 'Europe/Istanbul'; dkd_end:=dkd_start+interval '45 minutes';
   insert into db_style.db_style_appointments(business_id,branch_id,staff_id,service_id,customer_id,customer_user_id,starts_at,ends_at,quoted_base_cents,quoted_service_cents,quoted_fee_cents,source) values(dkd_business,dkd_branch,dkd_staff,dkd_service,dkd_customer,auth.uid(),dkd_start,dkd_end,35000,35000,2000,'demo') returning id into dkd_appointment;
   insert into db_style.db_style_calendar_entries(business_id,staff_id,starts_at,ends_at,kind,reference_id) values(dkd_business,dkd_staff,dkd_start,dkd_end,'appointment',dkd_appointment);
   insert into db_style.db_style_chat_conversations(business_id,staff_id,customer_user_id,appointment_id) values(dkd_business,dkd_staff,auth.uid(),dkd_appointment) returning id into dkd_receipt;
   insert into db_style.db_style_chat_messages(business_id,conversation_id,sender_id,body) values(dkd_business,dkd_receipt,auth.uid(),'Merhaba! Yarınki randevumu doğrulamak istiyorum.');
  end loop;
  perform db_style.db_style_notify(auth.uid(),null,'Demo veriler hazır','Üç işletme, dokuz usta ve örnek işlemler yüklendi. Demo etiketli veriler gerçek kayıtlarla karışmaz.','demo',dkd_batch);
  perform db_style.db_style_audit(null,'demo_loaded',dkd_batch,jsonb_build_object('businesses',3,'sessions',36));
  return jsonb_build_object('id',dkd_batch,'businesses',3,'staff',9);
 elsif dkd_action='demo_remove' then
  -- Delete only records whose business belongs to the active demo batch.
  select id into dkd_batch from db_style.db_style_demo_batches where removed_at is null limit 1;
  if dkd_batch is null then return jsonb_build_object('removed',false); end if;
  perform set_config('db_style.demo_cleanup',dkd_batch::text,true);
  for dkd_business in select id from db_style.db_style_businesses where demo_batch_id=dkd_batch loop
   delete from db_style.db_style_message_reports where message_id in(select id from db_style.db_style_chat_messages where business_id=dkd_business);
   delete from db_style.db_style_chat_blocks where conversation_id in(select id from db_style.db_style_chat_conversations where business_id=dkd_business);
   foreach dkd_name in array array['db_style_chat_messages','db_style_chat_conversations','db_style_appointment_locations','db_style_payment_allocations','db_style_payment_receipts','db_style_payment_claims','db_style_platform_fee_ledger','db_style_session_reversals','db_style_service_payment_events','db_style_reviews','db_style_notifications','db_style_waitlists','db_style_extra_slot_requests','db_style_walkin_queue','db_style_service_sessions','db_style_appointments','db_style_customer_notes','db_style_customer_discounts','db_style_customers','db_style_staff_services','db_style_working_hours','db_style_staff_status','db_style_calendar_entries','db_style_platform_fee_rules','db_style_promo_codes','db_style_business_members','db_style_staff','db_style_payment_periods','db_style_payment_plans','db_style_favorites','db_style_loyalty_programs','db_style_campaigns','db_style_branches'] loop
    execute format('delete from db_style.%I where business_id=$1',dkd_name) using dkd_business;
   end loop;
   delete from db_style.db_style_businesses where id=dkd_business and demo_batch_id=dkd_batch;
  end loop;
  update db_style.db_style_demo_batches set removed_at=now() where id=dkd_batch;
  perform db_style.db_style_audit(null,'demo_removed',dkd_batch);
  return jsonb_build_object('removed',true,'id',dkd_batch);
 end if;
 raise exception 'Demo işlemi geçersiz.';
end $$;
create or replace function db_style.db_style_immutable() returns trigger language plpgsql set search_path='' as $$ begin
 if tg_op='DELETE' and tg_table_name<>'db_style_audit_logs' and db_style.db_style_is_admin() and exists(select 1 from db_style.db_style_businesses b where b.id=old.business_id and b.demo_batch_id::text=current_setting('db_style.demo_cleanup',true)) then return old; end if;
 raise exception 'Değiştirilemez kayıt: düzeltme için ters kayıt kullanın.' using errcode='42501';
end $$;
revoke all on all functions in schema db_style from public;
