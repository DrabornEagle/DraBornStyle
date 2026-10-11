create function db_style.db_style_query(dkd_resource text,dkd_filters jsonb default '{}') returns jsonb
language plpgsql stable security invoker set search_path='' as $$
declare dkd_business uuid:=nullif(dkd_filters->>'business_id','')::uuid; dkd_staff uuid:=nullif(dkd_filters->>'staff_id','')::uuid;
 dkd_id uuid:=nullif(dkd_filters->>'id','')::uuid; dkd_from timestamptz:=coalesce(nullif(dkd_filters->>'from','')::timestamptz,'2000-01-01'::timestamptz);
 dkd_to timestamptz:=coalesce(nullif(dkd_filters->>'to','')::timestamptz,'2100-01-01'::timestamptz); dkd_result jsonb; dkd_rows jsonb;
begin
 if dkd_resource='directory' then
  select coalesce(jsonb_agg(to_jsonb(x) order by x.name),'[]') into dkd_result from (
   select b.*,coalesce((select avg(r.rating)::numeric(3,2) from db_style.db_style_reviews r where r.business_id=b.id),0) as rating,
   (select count(*) from db_style.db_style_reviews r where r.business_id=b.id) as review_count,
   (select min(s.price_cents) from db_style.db_style_services s where s.business_id=b.id and s.active) as min_price_cents,
   coalesce((select jsonb_agg(to_jsonb(s)) from db_style.db_style_staff s where s.business_id=b.id and s.active),'[]') as staff,
   coalesce((select jsonb_agg(to_jsonb(s)) from db_style.db_style_services s where s.business_id=b.id and s.active),'[]') as services
   from db_style.db_style_businesses b where b.published and b.active and (dkd_business is null or b.id=dkd_business) and
   (nullif(dkd_filters->>'search','') is null or b.name ilike '%'||(dkd_filters->>'search')||'%' or b.city ilike '%'||(dkd_filters->>'search')||'%')
   order by b.name limit 100
  )x;
 elsif dkd_resource='business' then
  select to_jsonb(b)||jsonb_build_object(
   'branches',coalesce((select jsonb_agg(to_jsonb(x)) from db_style.db_style_branches x where x.business_id=b.id),'[]'),
   'staff',coalesce((select jsonb_agg(to_jsonb(x)||jsonb_build_object('state',coalesce((select to_jsonb(z) from db_style.db_style_staff_status z where z.staff_id=x.id),'{}'))) from db_style.db_style_staff x where x.business_id=b.id),'[]'),
   'services',coalesce((select jsonb_agg(to_jsonb(x)) from db_style.db_style_services x where x.business_id=b.id),'[]'),
   'staff_services',coalesce((select jsonb_agg(to_jsonb(x)) from db_style.db_style_staff_services x where x.business_id=b.id),'[]'),
   'hours',coalesce((select jsonb_agg(to_jsonb(x) order by x.weekday) from db_style.db_style_working_hours x where x.business_id=b.id),'[]'),
   'reviews',coalesce((select jsonb_agg(to_jsonb(x)) from db_style.db_style_reviews x where x.business_id=b.id),'[]')
  ) into dkd_result from db_style.db_style_businesses b where b.id=dkd_business;
 else
  if auth.uid() is null then raise exception 'Giriş yapmalısınız.' using errcode='42501'; end if;
  if dkd_resource='bootstrap' then
   dkd_result:=jsonb_build_object('profile',(select to_jsonb(x) from db_style.db_style_profiles x where user_id=auth.uid()),'is_admin',db_style.db_style_is_admin(),
    'memberships',coalesce((select jsonb_agg(to_jsonb(x)||jsonb_build_object('business_name',b.name)) from db_style.db_style_business_members x join db_style.db_style_businesses b on b.id=x.business_id where x.user_id=auth.uid() and x.active),'[]'),
    'demo_batches',coalesce((select jsonb_agg(to_jsonb(x)) from db_style.db_style_demo_batches x where removed_at is null),'[]'),
    'settings',coalesce((select jsonb_object_agg(key,value) from db_style.db_style_app_settings),'{}'));
  elsif dkd_resource='appointments' then
   select coalesce(jsonb_agg(to_jsonb(x) order by x.starts_at),'[]') into dkd_result from (
    select a.*,b.name as business_name,b.address,b.latitude,b.longitude,b.cover_url,s.name as staff_name,s.photo_url as staff_photo,v.name as service_name,v.duration_minutes,c.name as customer_name,
     (select to_jsonb(l) from db_style.db_style_appointment_locations l where l.appointment_id=a.id) as location
    from db_style.db_style_appointments a join db_style.db_style_businesses b on b.id=a.business_id join db_style.db_style_staff s on s.id=a.staff_id join db_style.db_style_services v on v.id=a.service_id join db_style.db_style_customers c on c.id=a.customer_id
    where (dkd_business is null or a.business_id=dkd_business) and (dkd_staff is null or a.staff_id=dkd_staff) and (dkd_id is null or a.id=dkd_id)
      and (coalesce((dkd_filters->>'mine')::boolean,false)=false or a.customer_user_id=auth.uid()) and a.starts_at>=dkd_from and a.starts_at<dkd_to order by a.starts_at desc limit 300
   )x;
  elsif dkd_resource='sessions' then
   select coalesce(jsonb_agg(to_jsonb(x) order by x.started_at desc),'[]') into dkd_result from(
    select s.*,c.name as customer_name,c.user_id as customer_user_id,t.name as staff_name,v.name as service_name,(select id from db_style.db_style_reviews r where r.session_id=s.id) as review_id
    from db_style.db_style_service_sessions s join db_style.db_style_customers c on c.id=s.customer_id join db_style.db_style_staff t on t.id=s.staff_id join db_style.db_style_services v on v.id=s.service_id
    where (dkd_business is null or s.business_id=dkd_business) and (dkd_staff is null or s.staff_id=dkd_staff) and (dkd_id is null or s.id=dkd_id) and (coalesce((dkd_filters->>'mine')::boolean,false)=false or c.user_id=auth.uid())
     and (s.state='active' or (s.completed_at>=dkd_from and s.completed_at<dkd_to)) order by s.started_at desc limit 300
   )x;
  elsif dkd_resource='requests' then
   dkd_result:=jsonb_build_object('waitlists',coalesce((select jsonb_agg(to_jsonb(w)) from db_style.db_style_waitlists w where (dkd_business is null or w.business_id=dkd_business) and (dkd_staff is null or w.staff_id=dkd_staff)),'[]'),
    'extra',coalesce((select jsonb_agg(to_jsonb(w)) from db_style.db_style_extra_slot_requests w where (dkd_business is null or w.business_id=dkd_business) and (dkd_staff is null or w.staff_id=dkd_staff)),'[]'),
    'queue',coalesce((select jsonb_agg(to_jsonb(w)||jsonb_build_object('customer_name',c.name,'service_name',s.name,'duration_minutes',s.duration_minutes)) from db_style.db_style_walkin_queue w join db_style.db_style_customers c on c.id=w.customer_id join db_style.db_style_services s on s.id=w.service_id where (dkd_business is null or w.business_id=dkd_business) and (dkd_staff is null or w.staff_id=dkd_staff) and w.state in ('waiting','called')),'[]'));
  elsif dkd_resource='customers' then
   select coalesce(jsonb_agg(to_jsonb(x)),'[]') into dkd_result from(
    select c.*,(select count(*) from db_style.db_style_service_sessions s where s.customer_id=c.id and state='completed') as visits,
    (select max(completed_at) from db_style.db_style_service_sessions s where s.customer_id=c.id and state='completed') as last_visit,
    coalesce((select jsonb_agg(to_jsonb(n)) from db_style.db_style_customer_notes n where n.customer_id=c.id),'[]') as notes,
    coalesce((select jsonb_agg(to_jsonb(n)) from db_style.db_style_customer_discounts n where n.customer_id=c.id),'[]') as discounts
    from db_style.db_style_customers c where (dkd_business is null or c.business_id=dkd_business) and (dkd_id is null or c.id=dkd_id) order by c.name limit 300
   )x;
  elsif dkd_resource='messages' then
   if not db_style.db_style_conversation_access(dkd_id) then raise exception 'Sohbete erişim yetkiniz yok.'; end if;
   select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at),'[]') into dkd_rows from(select * from db_style.db_style_chat_messages where conversation_id=dkd_id order by created_at desc limit 150)x;
   dkd_result:=jsonb_build_object('messages',dkd_rows,'blocked',exists(select 1 from db_style.db_style_chat_blocks where user_id=auth.uid() and conversation_id=dkd_id));
  elsif dkd_resource='conversations' then
   select coalesce(jsonb_agg(to_jsonb(x)),'[]') into dkd_result from(
    select c.*,s.name as staff_name,s.photo_url,b.name as business_name,
     (select body from db_style.db_style_chat_messages m where m.conversation_id=c.id order by created_at desc limit 1) as last_message,
     (select count(*) from db_style.db_style_chat_messages m where m.conversation_id=c.id and read_at is null and sender_id<>auth.uid()) as unread
    from db_style.db_style_chat_conversations c join db_style.db_style_staff s on s.id=c.staff_id join db_style.db_style_businesses b on b.id=c.business_id where (dkd_business is null or c.business_id=dkd_business) order by c.created_at desc limit 100
   )x;
  elsif dkd_resource='notifications' then select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at desc),'[]') into dkd_result from(select * from db_style.db_style_notifications where user_id=auth.uid() order by created_at desc limit 100)x;
  elsif dkd_resource='favorites' then select coalesce(jsonb_agg(to_jsonb(b)),'[]') into dkd_result from db_style.db_style_favorites f join db_style.db_style_businesses b on b.id=f.business_id where f.user_id=auth.uid();
  elsif dkd_resource='management' then
   if not db_style.db_style_can_manage(dkd_business) then raise exception 'İşletme yönetimi yetkiniz yok.'; end if;
   dkd_result:=jsonb_build_object('members',coalesce((select jsonb_agg(to_jsonb(x)) from db_style.db_style_business_members x where business_id=dkd_business),'[]'),
    'fee_rules',coalesce((select jsonb_agg(to_jsonb(x) order by valid_from desc) from db_style.db_style_platform_fee_rules x where business_id=dkd_business),'[]'),
    'promo_codes',coalesce((select jsonb_agg(to_jsonb(x)) from db_style.db_style_promo_codes x where business_id=dkd_business),'[]'),
    'loyalty',(select to_jsonb(x) from db_style.db_style_loyalty_programs x where business_id=dkd_business),
    'campaigns',coalesce((select jsonb_agg(to_jsonb(x)) from db_style.db_style_campaigns x where business_id=dkd_business),'[]'));
  elsif dkd_resource='finance' then
   if dkd_business is not null and not db_style.db_style_can_finance(dkd_business) then raise exception 'Finans raporu yetkiniz yok.'; end if;
   dkd_result:=jsonb_build_object('balances',coalesce((select jsonb_agg(to_jsonb(x)||jsonb_build_object('business_name',b.name)) from db_style.db_style_business_balances x join db_style.db_style_businesses b on b.id=x.business_id where (dkd_business is null or x.business_id=dkd_business) and db_style.db_style_can_finance(x.business_id)),'[]'),
    'periods',coalesce((select jsonb_agg(to_jsonb(x)||jsonb_build_object(
      'charge_cents',coalesce((select sum(amount_cents) from db_style.db_style_platform_fee_ledger l where l.period_id=x.id),0),
      'paid_cents',coalesce((select sum(amount_cents) from db_style.db_style_payment_allocations l where l.period_id=x.id),0),
      'pending_cents',coalesce((select sum(amount_cents) from db_style.db_style_payment_claims l where l.period_id=x.id and state='pending'),0),
      'rejected_count',(select count(*) from db_style.db_style_payment_claims l where l.period_id=x.id and state='rejected')
     ) order by x.ends_at desc) from db_style.db_style_payment_periods x where (dkd_business is null or x.business_id=dkd_business)),'[]'),
    'claims',coalesce((select jsonb_agg(to_jsonb(x)||jsonb_build_object('business_name',b.name) order by x.created_at desc) from db_style.db_style_payment_claims x join db_style.db_style_businesses b on b.id=x.business_id where (dkd_business is null or x.business_id=dkd_business)),'[]'),
    'plans',coalesce((select jsonb_agg(to_jsonb(x)||jsonb_build_object('business_name',b.name)) from db_style.db_style_payment_plans x join db_style.db_style_businesses b on b.id=x.business_id where (dkd_business is null or x.business_id=dkd_business)),'[]'),
    'rules',coalesce((select jsonb_agg(to_jsonb(x) order by valid_from desc) from db_style.db_style_platform_fee_rules x where (dkd_business is null or x.business_id=dkd_business)),'[]'),
    'receipts',coalesce((select jsonb_agg(to_jsonb(x) order by confirmed_at desc) from db_style.db_style_payment_receipts x where (dkd_business is null or x.business_id=dkd_business)),'[]'));
  elsif dkd_resource='stats' then
   -- Sessions and ledger are independently aggregated to avoid joins multiplying revenue.
   dkd_result:=jsonb_build_object(
    'business_count',(select count(*) from db_style.db_style_businesses where active),
    'staff_count',(select count(*) from db_style.db_style_staff where active and (dkd_business is null or business_id=dkd_business)),
    'appointments',(select count(*) from db_style.db_style_appointments where (dkd_business is null or business_id=dkd_business) and (dkd_staff is null or staff_id=dkd_staff) and starts_at>=dkd_from and starts_at<dkd_to),
    'cancelled',(select count(*) from db_style.db_style_appointments where status='cancelled' and (dkd_business is null or business_id=dkd_business) and (dkd_staff is null or staff_id=dkd_staff) and starts_at>=dkd_from and starts_at<dkd_to),
    'no_show',(select count(*) from db_style.db_style_appointments where status='no_show' and (dkd_business is null or business_id=dkd_business) and (dkd_staff is null or staff_id=dkd_staff) and starts_at>=dkd_from and starts_at<dkd_to),
    'completed',(select count(*) from db_style.db_style_service_sessions where state='completed' and (dkd_business is null or business_id=dkd_business) and (dkd_staff is null or staff_id=dkd_staff) and completed_at>=dkd_from and completed_at<dkd_to),
    'service_cents',coalesce((select sum(service_cents) from db_style.db_style_service_sessions where state='completed' and (dkd_business is null or business_id=dkd_business) and (dkd_staff is null or staff_id=dkd_staff) and completed_at>=dkd_from and completed_at<dkd_to),0),
    'fee_cents',coalesce((select sum(l.amount_cents) from db_style.db_style_platform_fee_ledger l join db_style.db_style_service_sessions s on s.id=l.session_id where (dkd_business is null or l.business_id=dkd_business) and (dkd_staff is null or s.staff_id=dkd_staff) and l.created_at>=dkd_from and l.created_at<dkd_to),0),
    'collected_cents',coalesce((select sum(amount_cents) from db_style.db_style_payment_receipts where (dkd_business is null or business_id=dkd_business) and confirmed_at>=dkd_from and confirmed_at<dkd_to),0),
    'avg_minutes',coalesce((select round(avg(extract(epoch from completed_at-started_at)/60)) from db_style.db_style_service_sessions where state='completed' and (dkd_business is null or business_id=dkd_business) and (dkd_staff is null or staff_id=dkd_staff) and completed_at>=dkd_from and completed_at<dkd_to),0),
    'unique_customers',(select count(distinct customer_id) from db_style.db_style_service_sessions where state='completed' and (dkd_business is null or business_id=dkd_business) and (dkd_staff is null or staff_id=dkd_staff) and completed_at>=dkd_from and completed_at<dkd_to),
    'daily',coalesce((select jsonb_agg(to_jsonb(x) order by x.day) from(
     select (completed_at at time zone 'Europe/Istanbul')::date as day,count(*) as count,sum(service_cents) as service_cents,sum(fee_cents) as fee_cents from db_style.db_style_service_sessions where state='completed' and (dkd_business is null or business_id=dkd_business) and (dkd_staff is null or staff_id=dkd_staff) and completed_at>=dkd_from and completed_at<dkd_to group by 1)x),'[]'),
    'staff',coalesce((select jsonb_agg(to_jsonb(x)) from(
     select st.id,st.name,st.photo_url,st.target_monthly,count(s.id) as completed,coalesce(sum(s.service_cents),0) as service_cents,coalesce(sum(s.fee_cents),0) as fee_cents,
      coalesce(round(avg(extract(epoch from s.completed_at-s.started_at)/60)),0) as avg_minutes,
      count(s.id) filter(where s.source='app') as app_customers,count(distinct s.customer_id) as unique_customers,
      coalesce((select avg(rating)::numeric(3,2) from db_style.db_style_reviews r where r.staff_id=st.id),0) as rating
     from db_style.db_style_staff st left join db_style.db_style_service_sessions s on s.staff_id=st.id and s.state='completed' and s.completed_at>=dkd_from and s.completed_at<dkd_to
     where (dkd_business is null or st.business_id=dkd_business) and (dkd_staff is null or st.id=dkd_staff) group by st.id)x),'[]'),
    'services',coalesce((select jsonb_agg(to_jsonb(x)) from(select v.id,v.name,count(s.id) as count,coalesce(sum(s.service_cents),0) as service_cents from db_style.db_style_services v left join db_style.db_style_service_sessions s on s.service_id=v.id and s.state='completed' and s.completed_at>=dkd_from and s.completed_at<dkd_to and (dkd_staff is null or s.staff_id=dkd_staff) where (dkd_business is null or v.business_id=dkd_business) group by v.id order by count(s.id) desc)x),'[]'));
  elsif dkd_resource='audit' then
   select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at desc),'[]') into dkd_result from(select * from db_style.db_style_audit_logs where (dkd_business is null or business_id=dkd_business) order by created_at desc limit 200)x;
  else raise exception 'Bilinmeyen veri ekranı: %',dkd_resource;
  end if;
 end if;
 return coalesce(dkd_result,'null'::jsonb);
end $$;

create function public.db_style_query(dkd_resource text,dkd_filters jsonb default '{}') returns jsonb language sql security invoker set search_path='' as $$ select db_style.db_style_query(dkd_resource,dkd_filters) $$;
create function public.db_style_quote(dkd_business uuid,dkd_staff uuid,dkd_service uuid,dkd_code text default null) returns jsonb
language plpgsql security invoker set search_path='' as $$ declare dkd_customer uuid; begin
 if auth.uid() is null then raise exception 'Fiyat teklifi için giriş yapın.'; end if;
 select id into dkd_customer from db_style.db_style_customers where business_id=dkd_business and user_id=auth.uid();
 return db_style.db_style_quote(dkd_business,dkd_staff,dkd_service,dkd_customer,dkd_code);
end $$;
-- A separate safe quote helper is callable by users and binds discounts to auth.uid().
create function db_style.db_style_customer_quote(dkd_business uuid,dkd_staff uuid,dkd_service uuid,dkd_code text default null) returns jsonb
language plpgsql stable security definer set search_path='' as $$ declare dkd_customer uuid; begin
 if auth.uid() is null then raise exception 'Giriş yapın.'; end if;
 select id into dkd_customer from db_style.db_style_customers where business_id=dkd_business and user_id=auth.uid();
 return db_style.db_style_quote(dkd_business,dkd_staff,dkd_service,dkd_customer,dkd_code);
end $$;
create or replace function public.db_style_quote(dkd_business uuid,dkd_staff uuid,dkd_service uuid,dkd_code text default null) returns jsonb language sql security invoker set search_path='' as $$ select db_style.db_style_customer_quote(dkd_business,dkd_staff,dkd_service,dkd_code) $$;
revoke all on function public.db_style_query(text,jsonb),public.db_style_quote(uuid,uuid,uuid,text) from public;
grant execute on function public.db_style_query(text,jsonb),db_style.db_style_query(text,jsonb) to authenticated,anon;
grant execute on function public.db_style_quote(uuid,uuid,uuid,text),db_style.db_style_customer_quote(uuid,uuid,uuid,text) to authenticated;

create function db_style.db_style_tick() returns jsonb language plpgsql security definer set search_path='' as $$
declare dkd_a record; dkd_m uuid; dkd_p record; dkd_s record; dkd_n int:=0; begin
 update db_style.db_style_calendar_entries set active=false where active and expires_at<=now();
 update db_style.db_style_extra_slot_requests set state='expired' where state='offered' and hold_expires_at<=now();
 update db_style.db_style_appointment_locations set shared=false,latitude=null,longitude=null where shared and expires_at<=now();
 for dkd_s in select * from db_style.db_style_staff_status where status in ('busy','break') and expected_return_at<=now() loop
  update db_style.db_style_staff_status set status='available',expected_return_at=null,updated_at=now() where staff_id=dkd_s.staff_id;
  perform db_style.db_style_release_waitlist(dkd_s.staff_id,now(),now()+interval '3 hours');
 end loop;
 for dkd_a in select * from db_style.db_style_appointments where status='booked' and starts_at between now() and now()+interval '1 hour' loop
  perform db_style.db_style_notify(dkd_a.customer_user_id,dkd_a.business_id,'Randevunuza az kaldı',to_char(dkd_a.starts_at at time zone 'Europe/Istanbul','HH24:MI')||' için hazırlanmayı unutmayın.','reminder',dkd_a.id,'hour:'||dkd_a.id);
  if dkd_a.starts_at<=now()+interval '15 minutes' then
   for dkd_m in select user_id from db_style.db_style_business_members where business_id=dkd_a.business_id and active and (role in ('owner','manager') or staff_id=dkd_a.staff_id) loop
    perform db_style.db_style_notify(dkd_m,dkd_a.business_id,'Müşteriniz yaklaşıyor','Randevuya 15 dakika veya daha az kaldı.','reminder',dkd_a.id,'staff15:'||dkd_a.id||':'||dkd_m);
   end loop;
  end if;
  dkd_n:=dkd_n+1;
 end loop;
 for dkd_p in select p.*,coalesce((select sum(amount_cents) from db_style.db_style_platform_fee_ledger l where l.period_id=p.id),0)-coalesce((select sum(amount_cents) from db_style.db_style_payment_allocations a where a.period_id=p.id),0) as debt from db_style.db_style_payment_periods p where due_at<=now()+interval '1 day' loop
  if dkd_p.debt>0 then
   for dkd_m in select user_id from db_style.db_style_business_members where business_id=dkd_p.business_id and active and role in ('owner','manager') loop
    perform db_style.db_style_notify(dkd_m,dkd_p.business_id,case when dkd_p.due_at<now() then 'Platform ödemeniz gecikti' else 'Platform ödeme gününüz geldi' end,'Platform ödemeleri ekranından ödeme bildiriminizi gönderebilirsiniz.','payment_due',dkd_p.id,'due:'||dkd_p.id||':'||dkd_m||':'||(now() at time zone 'Europe/Istanbul')::date);
   end loop;
   if dkd_p.due_at<now() then for dkd_m in select user_id from db_style.db_style_admin_users where active loop perform db_style.db_style_notify(dkd_m,dkd_p.business_id,'Geciken işletme ödemesi','İşletmenin tahsil edilmemiş dönem borcu var.','payment_due',dkd_p.id,'admin_due:'||dkd_p.id||':'||dkd_m||':'||(now() at time zone 'Europe/Istanbul')::date); end loop; end if;
  end if;
 end loop;
 return jsonb_build_object('reminders_checked',dkd_n);
end $$;
revoke all on function db_style.db_style_tick() from public,anon,authenticated;
select cron.schedule('db_style_reminders','*/5 * * * *','select db_style.db_style_tick();');

-- Add only DraBornStyle tables. Existing publication members stay untouched.
do $$ declare dkd_t text; begin
 foreach dkd_t in array array['db_style_appointments','db_style_service_sessions','db_style_staff_status','db_style_notifications','db_style_chat_messages','db_style_extra_slot_requests','db_style_waitlists','db_style_walkin_queue','db_style_appointment_locations','db_style_payment_claims'] loop
  execute format('alter publication supabase_realtime add table db_style.%I',dkd_t);
 end loop;
end $$;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('db_style_media','db_style_media',true,5242880,array['image/jpeg','image/png','image/webp']),
 ('db_style_receipts','db_style_receipts',false,10485760,array['image/jpeg','image/png','application/pdf']);
create policy db_style_media_read on storage.objects for select to anon,authenticated using(bucket_id='db_style_media');
create policy db_style_media_write on storage.objects for insert to authenticated with check(bucket_id='db_style_media' and (split_part(name,'/',1)=(select auth.uid())::text or db_style.db_style_can_manage(nullif(split_part(name,'/',1),'')::uuid)));
create policy db_style_receipt_write on storage.objects for insert to authenticated with check(bucket_id='db_style_receipts' and db_style.db_style_can_manage(nullif(split_part(name,'/',1),'')::uuid));
create policy db_style_receipt_read on storage.objects for select to authenticated using(bucket_id='db_style_receipts' and db_style.db_style_can_finance(nullif(split_part(name,'/',1),'')::uuid));

notify pgrst,'reload schema';
