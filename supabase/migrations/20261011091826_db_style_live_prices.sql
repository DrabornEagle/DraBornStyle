-- Public catalog changes must refresh only the business currently being viewed.
alter publication supabase_realtime add table db_style.db_style_businesses,db_style.db_style_staff,db_style.db_style_services,db_style.db_style_staff_services,db_style.db_style_working_hours;
create or replace function db_style.db_style_execute(dkd_action text,dkd_payload jsonb,dkd_key uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
 dkd_uid uuid:=auth.uid(); dkd_business uuid:=nullif(dkd_payload->>'business_id','')::uuid; dkd_staff uuid:=nullif(dkd_payload->>'staff_id','')::uuid;
 dkd_service uuid:=nullif(dkd_payload->>'service_id','')::uuid; dkd_id uuid:=nullif(dkd_payload->>'id','')::uuid; dkd_customer uuid:=nullif(dkd_payload->>'customer_id','')::uuid;
 dkd_at timestamptz:=nullif(dkd_payload->>'starts_at','')::timestamptz; dkd_end timestamptz; dkd_quote jsonb; dkd_result jsonb; dkd_hash text:=md5(dkd_payload::text);
 dkd_old db_style.db_style_idempotency_keys; dkd_s db_style.db_style_staff; dkd_a db_style.db_style_appointments; dkd_session db_style.db_style_service_sessions;
 dkd_request db_style.db_style_extra_slot_requests; dkd_claim db_style.db_style_payment_claims; dkd_conversation db_style.db_style_chat_conversations;
 dkd_duration int; dkd_branch uuid; dkd_period uuid; dkd_receipt uuid; dkd_member uuid; dkd_price bigint; dkd_fee bigint; dkd_amount bigint; dkd_remaining bigint;
 dkd_reason text:=nullif(trim(dkd_payload->>'reason'),''); dkd_text text; dkd_n int; dkd_other record; dkd_state text; dkd_ok boolean;
begin
 if dkd_uid is null then raise exception 'Bu işlem için giriş yapmalısınız.' using errcode='42501'; end if;
 if dkd_key is null then raise exception 'İşlem anahtarı gerekli.'; end if;
 perform pg_advisory_xact_lock(hashtextextended(dkd_uid::text||dkd_key::text,0));
 select * into dkd_old from db_style.db_style_idempotency_keys where user_id=dkd_uid and key=dkd_key;
 if dkd_old.key is not null then
  if dkd_old.action<>dkd_action or dkd_old.payload_hash<>dkd_hash then raise exception 'İşlem anahtarı farklı bir isteğe ait.'; end if;
  return dkd_old.result;
 end if;

 if dkd_action='profile_save' then
  insert into db_style.db_style_profiles(user_id,display_name,phone,preferred_role,avatar_url)
  values(dkd_uid,coalesce(nullif(trim(dkd_payload->>'name'),''),'Yeni Müşteri'),dkd_payload->>'phone',coalesce(dkd_payload->>'preferred_role','customer'),dkd_payload->>'avatar_url')
  on conflict(user_id) do update set display_name=excluded.display_name,phone=excluded.phone,avatar_url=coalesce(excluded.avatar_url,db_style.db_style_profiles.avatar_url),updated_at=now();
  dkd_result:=jsonb_build_object('id',dkd_uid);
 elsif dkd_action='business_create' then
  if not exists(select 1 from db_style.db_style_profiles where user_id=dkd_uid) then raise exception 'Önce profilinizi tamamlayın.'; end if;
  insert into db_style.db_style_businesses(name,address,city,phone,latitude,longitude,cover_url,description)
   values(trim(dkd_payload->>'name'),coalesce(dkd_payload->>'address',''),coalesce(dkd_payload->>'city',''),dkd_payload->>'phone',nullif(dkd_payload->>'latitude','')::numeric,nullif(dkd_payload->>'longitude','')::numeric,dkd_payload->>'cover_url',coalesce(dkd_payload->>'description','')) returning id into dkd_business;
  insert into db_style.db_style_branches(business_id,address,latitude,longitude) select id,address,latitude,longitude from db_style.db_style_businesses where id=dkd_business returning id into dkd_branch;
  insert into db_style.db_style_business_members(business_id,user_id,role,can_edit_prices,can_view_finance,can_manage_services) values(dkd_business,dkd_uid,'owner',true,true,true);
  insert into db_style.db_style_working_hours(business_id,branch_id,weekday,open_minute,close_minute,closed) select dkd_business,dkd_branch,n,540,1200,n=7 from generate_series(1,7)n;
  insert into db_style.db_style_payment_plans(business_id) values(dkd_business);
  for dkd_member in select user_id from db_style.db_style_admin_users where active loop perform db_style.db_style_notify(dkd_member,dkd_business,'Yeni işletme',dkd_payload->>'name','business',dkd_business); end loop;
  dkd_result:=jsonb_build_object('id',dkd_business,'branch_id',dkd_branch);
 elsif dkd_action='business_save' then
  if not db_style.db_style_can_manage(dkd_business) then raise exception 'İşletme yönetimi yetkiniz yok.' using errcode='42501'; end if;
  update db_style.db_style_businesses set name=coalesce(dkd_payload->>'name',name),description=coalesce(dkd_payload->>'description',description),address=coalesce(dkd_payload->>'address',address),city=coalesce(dkd_payload->>'city',city),phone=coalesce(dkd_payload->>'phone',phone),latitude=coalesce(nullif(dkd_payload->>'latitude','')::numeric,latitude),longitude=coalesce(nullif(dkd_payload->>'longitude','')::numeric,longitude),cover_url=coalesce(dkd_payload->>'cover_url',cover_url),logo_url=coalesce(dkd_payload->>'logo_url',logo_url),gallery=coalesce(dkd_payload->'gallery',gallery),published=coalesce((dkd_payload->>'published')::boolean,published),price_edit_limit_bps=coalesce((dkd_payload->>'price_edit_limit_bps')::int,price_edit_limit_bps),price_reason_required=coalesce((dkd_payload->>'price_reason_required')::boolean,price_reason_required) where id=dkd_business;
  update db_style.db_style_branches br set address=b.address,latitude=b.latitude,longitude=b.longitude from db_style.db_style_businesses b where br.business_id=b.id and b.id=dkd_business and br.name='Merkez';
  dkd_result:=jsonb_build_object('id',dkd_business);
 elsif dkd_action='staff_save' then
  if not db_style.db_style_can_manage(dkd_business) then raise exception 'Çalışan yönetimi yetkiniz yok.' using errcode='42501'; end if;
  select id into dkd_branch from db_style.db_style_branches where business_id=dkd_business and active order by name limit 1;
  if dkd_staff is null then
   insert into db_style.db_style_staff(business_id,branch_id,name,specialties,photo_url,target_monthly) values(dkd_business,dkd_branch,trim(dkd_payload->>'name'),coalesce(dkd_payload->>'specialties','Saç & sakal'),dkd_payload->>'photo_url',coalesce((dkd_payload->>'target_monthly')::int,150)) returning id into dkd_staff;
   insert into db_style.db_style_staff_status(staff_id,business_id) values(dkd_staff,dkd_business);
  else
   update db_style.db_style_staff set name=coalesce(dkd_payload->>'name',name),specialties=coalesce(dkd_payload->>'specialties',specialties),photo_url=coalesce(dkd_payload->>'photo_url',photo_url),active=coalesce((dkd_payload->>'active')::boolean,active),target_monthly=coalesce((dkd_payload->>'target_monthly')::int,target_monthly) where id=dkd_staff and business_id=dkd_business;
   if not found then raise exception 'Usta bulunamadı.'; end if;
  end if;
  if nullif(trim(dkd_payload->>'member_email'),'') is not null then
   select id into dkd_member from auth.users where lower(email)=lower(trim(dkd_payload->>'member_email'));
   if dkd_member is null then raise exception 'Çalışan önce kendi hesabını oluşturmalı.'; end if;
   if exists(select 1 from db_style.db_style_business_members where business_id=dkd_business and user_id=dkd_member and role='owner') then raise exception 'İşletme sahibi rolü değiştirilemez.'; end if;
   insert into db_style.db_style_business_members(business_id,user_id,role,staff_id,can_edit_prices,can_manage_services,can_view_finance,active) values(dkd_business,dkd_member,'staff',dkd_staff,coalesce((dkd_payload->>'can_edit_prices')::boolean,false),coalesce((dkd_payload->>'can_manage_services')::boolean,false),coalesce((dkd_payload->>'can_view_finance')::boolean,false),coalesce((dkd_payload->>'active')::boolean,true))
   on conflict(business_id,user_id) do update set role='staff',staff_id=excluded.staff_id,can_edit_prices=excluded.can_edit_prices,can_manage_services=excluded.can_manage_services,can_view_finance=excluded.can_view_finance,active=excluded.active;
  end if;
  update db_style.db_style_business_members m set active=s.active from db_style.db_style_staff s where s.id=dkd_staff and m.staff_id=s.id and m.role='staff';
  dkd_result:=jsonb_build_object('id',dkd_staff);
 elsif dkd_action='service_save' then
  if not(db_style.db_style_can_manage(dkd_business) or exists(select 1 from db_style.db_style_business_members where business_id=dkd_business and user_id=dkd_uid and active and can_manage_services)) then raise exception 'Hizmet düzenleme yetkiniz yok.' using errcode='42501'; end if;
  if dkd_service is null then
   insert into db_style.db_style_services(business_id,name,duration_minutes,price_cents) values(dkd_business,trim(dkd_payload->>'name'),(dkd_payload->>'duration_minutes')::int,(dkd_payload->>'price_cents')::bigint) returning id into dkd_service;
  else
   update db_style.db_style_services set name=coalesce(dkd_payload->>'name',name),duration_minutes=coalesce((dkd_payload->>'duration_minutes')::int,duration_minutes),price_cents=coalesce((dkd_payload->>'price_cents')::bigint,price_cents),active=coalesce((dkd_payload->>'active')::boolean,active) where id=dkd_service and business_id=dkd_business;
   if not found then raise exception 'Hizmet bulunamadı.'; end if;
  end if;
  if dkd_payload ? 'staff_ids' then
   delete from db_style.db_style_staff_services where service_id=dkd_service;
   insert into db_style.db_style_staff_services(business_id,staff_id,service_id) select dkd_business,value::uuid,dkd_service from jsonb_array_elements_text(dkd_payload->'staff_ids');
  else
   insert into db_style.db_style_staff_services(business_id,staff_id,service_id) select dkd_business,id,dkd_service from db_style.db_style_staff where business_id=dkd_business and active on conflict do nothing;
  end if;
  dkd_result:=jsonb_build_object('id',dkd_service);
 elsif dkd_action='hours_save' then
  if not db_style.db_style_can_manage(dkd_business) then raise exception 'Çalışma saatlerini düzenleme yetkiniz yok.' using errcode='42501'; end if;
  dkd_branch:=nullif(dkd_payload->>'branch_id','')::uuid;
  if dkd_branch is null then select id into dkd_branch from db_style.db_style_branches where business_id=dkd_business and active order by name limit 1; end if;
  insert into db_style.db_style_working_hours(business_id,branch_id,staff_id,weekday,open_minute,close_minute,break_start,break_end,closed)
   values(dkd_business,dkd_branch,dkd_staff,(dkd_payload->>'weekday')::int,(dkd_payload->>'open_minute')::int,(dkd_payload->>'close_minute')::int,nullif(dkd_payload->>'break_start','')::int,nullif(dkd_payload->>'break_end','')::int,coalesce((dkd_payload->>'closed')::boolean,false))
   on conflict(branch_id,staff_id,weekday) do update set open_minute=excluded.open_minute,close_minute=excluded.close_minute,break_start=excluded.break_start,break_end=excluded.break_end,closed=excluded.closed;
  dkd_result:=jsonb_build_object('saved',true);
 elsif dkd_action in ('book','reschedule','extra_accept') then
  if dkd_action='reschedule' then
   select * into dkd_a from db_style.db_style_appointments where id=dkd_id for update;
   if dkd_a.id is null or not(dkd_a.customer_user_id=dkd_uid or db_style.db_style_can_staff(dkd_a.business_id,dkd_a.staff_id)) then raise exception 'Randevuya erişim yetkiniz yok.' using errcode='42501'; end if;
   if dkd_a.status not in ('booked','arrived') then raise exception 'Bu randevu değiştirilemez.'; end if;
   dkd_business:=dkd_a.business_id; dkd_staff:=dkd_a.staff_id; dkd_service:=dkd_a.service_id; dkd_customer:=dkd_a.customer_id;
   update db_style.db_style_calendar_entries set active=false where reference_id=dkd_id;
  elsif dkd_action='extra_accept' then
   select * into dkd_request from db_style.db_style_extra_slot_requests where id=dkd_id for update;
   if dkd_request.user_id is distinct from dkd_uid or dkd_request.state<>'offered' or dkd_request.hold_expires_at<=now() then raise exception 'Teklif geçerli değil.'; end if;
   dkd_business:=dkd_request.business_id; dkd_staff:=dkd_request.staff_id; dkd_service:=dkd_request.service_id; dkd_at:=dkd_request.offered_at;
   update db_style.db_style_calendar_entries set active=false where reference_id=dkd_id;
  end if;
  select * into dkd_s from db_style.db_style_staff where id=dkd_staff and business_id=dkd_business and active for update;
  if dkd_s.id is null then raise exception 'Usta bulunamadı.'; end if;
  update db_style.db_style_calendar_entries set active=false where staff_id=dkd_staff and active and expires_at<=now();
  select duration_minutes into dkd_duration from db_style.db_style_services where id=dkd_service and business_id=dkd_business and active;
  if dkd_duration is null or dkd_at<=now() then raise exception 'Gelecekteki uygun bir saat seçin.'; end if;
  dkd_end:=dkd_at+make_interval(mins=>dkd_duration);
  if dkd_action<>'extra_accept' and not exists(select 1 from jsonb_array_elements(db_style.db_style_slots(dkd_staff,dkd_service,(dkd_at at time zone 'Europe/Istanbul')::date)) where (value->>'available')::boolean and (value->>'starts_at')::timestamptz=dkd_at) then raise exception 'Bu saat artık müsait değil.'; end if;
  if dkd_customer is null then
   insert into db_style.db_style_customers(business_id,user_id,name) select dkd_business,dkd_uid,display_name from db_style.db_style_profiles where user_id=dkd_uid
   on conflict(business_id,user_id) do update set name=excluded.name returning id into dkd_customer;
   if dkd_customer is null then raise exception 'Önce profilinizi tamamlayın.'; end if;
  elsif not exists(select 1 from db_style.db_style_customers where id=dkd_customer and business_id=dkd_business and (user_id=dkd_uid or db_style.db_style_can_staff(dkd_business,dkd_staff))) then raise exception 'Müşteri yetkisi yok.' using errcode='42501'; end if;
  if dkd_action='reschedule' then
   update db_style.db_style_appointments set starts_at=dkd_at,ends_at=dkd_end,status='booked',updated_at=now() where id=dkd_id;
  else
   dkd_quote:=db_style.db_style_quote(dkd_business,dkd_staff,dkd_service,dkd_customer,dkd_payload->>'code');
   if (dkd_payload ? 'expected_service_cents' and (dkd_payload->>'expected_service_cents')::bigint<>(dkd_quote->>'service_cents')::bigint) or (dkd_payload ? 'expected_fee_cents' and (dkd_payload->>'expected_fee_cents')::bigint<>(dkd_quote->>'fee_cents')::bigint) then raise exception 'Fiyat güncellendi. Yeni tutarı kontrol ederek yeniden onaylayın.'; end if;
   if dkd_quote->>'promo_id' is not null then
    update db_style.db_style_promo_codes set uses=uses+1 where id=(dkd_quote->>'promo_id')::uuid and (max_uses is null or uses<max_uses);
    if not found then raise exception 'Kodun kullanım hakkı doldu.'; end if;
   end if;
   insert into db_style.db_style_appointments(business_id,branch_id,staff_id,service_id,customer_id,customer_user_id,starts_at,ends_at,quoted_base_cents,quoted_discount_cents,quoted_service_cents,quoted_fee_cents,promo_code_id,note)
    values(dkd_business,dkd_s.branch_id,dkd_staff,dkd_service,dkd_customer,(select user_id from db_style.db_style_customers where id=dkd_customer),dkd_at,dkd_end,(dkd_quote->>'base_cents')::bigint,(dkd_quote->>'discount_cents')::bigint,(dkd_quote->>'service_cents')::bigint,(dkd_quote->>'fee_cents')::bigint,(dkd_quote->>'promo_id')::uuid,coalesce(dkd_payload->>'note','')) returning id into dkd_id;
  end if;
  insert into db_style.db_style_calendar_entries(business_id,staff_id,starts_at,ends_at,kind,reference_id) values(dkd_business,dkd_staff,dkd_at,dkd_end,'appointment',dkd_id);
  if dkd_action='extra_accept' then update db_style.db_style_extra_slot_requests set state='accepted',appointment_id=dkd_id where id=dkd_request.id; end if;
  update db_style.db_style_waitlists set state='booked' where user_id=dkd_uid and staff_id=dkd_staff and state in ('waiting','notified') and range_start<=dkd_at and range_end>=dkd_end;
  select customer_user_id into dkd_member from db_style.db_style_appointments where id=dkd_id;
  perform db_style.db_style_notify(dkd_member,dkd_business,'Randevunuz onaylandı',to_char(dkd_at at time zone 'Europe/Istanbul','DD.MM HH24:MI')||' • '||dkd_s.name,'appointment',dkd_id);
  perform db_style.db_style_notify_team(dkd_business,dkd_staff,'Yeni / değişen randevu',to_char(dkd_at at time zone 'Europe/Istanbul','DD.MM HH24:MI'),'appointment',dkd_id);
  if dkd_action='reschedule' then perform db_style.db_style_release_waitlist(dkd_staff,dkd_a.starts_at,dkd_a.ends_at); end if;
  dkd_result:=jsonb_build_object('id',dkd_id);
 elsif dkd_action in ('cancel','no_show','arrived') then
  select * into dkd_a from db_style.db_style_appointments where id=dkd_id for update;
  if dkd_a.id is null or not(dkd_a.customer_user_id=dkd_uid or db_style.db_style_can_staff(dkd_a.business_id,dkd_a.staff_id)) then raise exception 'Randevuya erişim yetkiniz yok.' using errcode='42501'; end if;
  dkd_business:=dkd_a.business_id; dkd_staff:=dkd_a.staff_id;
  if dkd_a.status not in ('booked','arrived') then raise exception 'Randevu durumu bu işleme uygun değil.'; end if;
  if dkd_action='no_show' and (not db_style.db_style_can_staff(dkd_business,dkd_staff) or dkd_a.starts_at>now()) then raise exception 'Gelmeyen müşteri işlemi yetkili usta tarafından randevu saatinden sonra yapılır.'; end if;
  update db_style.db_style_appointments set status=case dkd_action when 'cancel' then 'cancelled' when 'no_show' then 'no_show' else 'arrived' end,updated_at=now() where id=dkd_id;
  if dkd_action<>'arrived' then
   update db_style.db_style_calendar_entries set active=false where reference_id=dkd_id;
   update db_style.db_style_appointment_locations set shared=false,latitude=null,longitude=null where appointment_id=dkd_id;
   perform db_style.db_style_release_waitlist(dkd_staff,dkd_a.starts_at,dkd_a.ends_at);
  end if;
  perform db_style.db_style_notify_team(dkd_business,dkd_staff,'Randevu güncellendi',case dkd_action when 'cancel' then 'Müşteri randevuyu iptal etti.' when 'arrived' then 'Müşteri geldi.' else 'Müşteri gelmedi.' end,'appointment',dkd_id);
  perform db_style.db_style_notify(dkd_a.customer_user_id,dkd_business,'Randevu güncellendi',case dkd_action when 'cancel' then 'Randevunuz iptal edildi.' when 'arrived' then 'İşletmeye varışınız kaydedildi.' else 'Randevunuz gelmedi olarak işaretlendi.' end,'appointment',dkd_id);
  dkd_result:=jsonb_build_object('id',dkd_id);
 elsif dkd_action in ('start_session','queue_start') then
  if dkd_payload->>'appointment_id' is not null then
   select * into dkd_a from db_style.db_style_appointments where id=(dkd_payload->>'appointment_id')::uuid for update;
   if dkd_a.status not in ('booked','arrived') or dkd_a.id is null then raise exception 'Randevu başlatılamıyor.'; end if;
   dkd_business:=dkd_a.business_id; dkd_staff:=dkd_a.staff_id; dkd_service:=dkd_a.service_id; dkd_customer:=dkd_a.customer_id;
  elsif dkd_action='queue_start' then
   select business_id,staff_id,service_id,customer_id into dkd_business,dkd_staff,dkd_service,dkd_customer from db_style.db_style_walkin_queue where id=dkd_id and state in ('waiting','called') for update;
   if not found then raise exception 'Sıradaki müşteri bulunamadı.'; end if;
  end if;
  if not db_style.db_style_can_staff(dkd_business,dkd_staff) then raise exception 'Yalnızca yetkili olduğunuz ustanın işlemini başlatabilirsiniz.' using errcode='42501'; end if;
  select * into dkd_s from db_style.db_style_staff where id=dkd_staff and business_id=dkd_business and active for update;
  if dkd_s.id is null then raise exception 'Usta aktif değil.'; end if;
  if exists(select 1 from db_style.db_style_service_sessions where staff_id=dkd_staff and state='active') then raise exception 'Önce devam eden işlemi bitirin.'; end if;
  select duration_minutes into dkd_duration from db_style.db_style_services where id=dkd_service and business_id=dkd_business and active;
  dkd_end:=now()+make_interval(mins=>dkd_duration);
  if dkd_a.id is not null then
   update db_style.db_style_calendar_entries set active=false where reference_id=dkd_a.id;
   dkd_quote:=jsonb_build_object('base_cents',dkd_a.quoted_base_cents,'discount_cents',dkd_a.quoted_discount_cents,'service_cents',dkd_a.quoted_service_cents,'fee_cents',dkd_a.quoted_fee_cents);
  else
   if dkd_customer is null then insert into db_style.db_style_customers(business_id,name) values(dkd_business,coalesce(nullif(trim(dkd_payload->>'customer_name'),''),'Misafir Müşteri')) returning id into dkd_customer;
   elsif not exists(select 1 from db_style.db_style_customers where id=dkd_customer and business_id=dkd_business and db_style.db_style_customer_access(dkd_business,id)) then raise exception 'Bu müşteri üzerinde yetkiniz yok.'; end if;
   dkd_quote:=db_style.db_style_quote(dkd_business,dkd_staff,dkd_service,dkd_customer,dkd_payload->>'code');
  end if;
  insert into db_style.db_style_service_sessions(business_id,branch_id,staff_id,service_id,customer_id,appointment_id,source,expected_end_at,normal_price_cents,discount_cents,quoted_service_cents,quoted_fee_cents)
   values(dkd_business,dkd_s.branch_id,dkd_staff,dkd_service,dkd_customer,dkd_a.id,case when dkd_a.id is null then 'walkin' else dkd_a.source end,dkd_end,(dkd_quote->>'base_cents')::bigint,(dkd_quote->>'discount_cents')::bigint,(dkd_quote->>'service_cents')::bigint,(dkd_quote->>'fee_cents')::bigint) returning id into dkd_id;
  update db_style.db_style_calendar_entries set active=false where staff_id=dkd_staff and kind='block' and active and ends_at<=now();
  insert into db_style.db_style_calendar_entries(business_id,staff_id,starts_at,ends_at,kind,reference_id) values(dkd_business,dkd_staff,now(),dkd_end,'session',dkd_id);
  update db_style.db_style_staff_status set status='in_progress',expected_return_at=dkd_end,updated_at=now() where staff_id=dkd_staff;
  if dkd_a.id is not null then update db_style.db_style_appointments set status='in_progress',updated_at=now() where id=dkd_a.id; end if;
  if dkd_action='queue_start' then update db_style.db_style_walkin_queue set state='served' where id=(dkd_payload->>'id')::uuid; end if;
  dkd_result:=jsonb_build_object('id',dkd_id);
 elsif dkd_action in ('finish_session','extend_session','reverse_session','service_paid') then
  select * into dkd_session from db_style.db_style_service_sessions where id=dkd_id for update;
  dkd_business:=dkd_session.business_id; dkd_staff:=dkd_session.staff_id;
  if dkd_session.id is null or not db_style.db_style_can_staff(dkd_business,dkd_staff) then raise exception 'İşlem yetkiniz yok.' using errcode='42501'; end if;
  if dkd_action='extend_session' then
   if dkd_session.state<>'active' then raise exception 'Bu işlem aktif değil.'; end if;
   dkd_n:=(dkd_payload->>'minutes')::int; if dkd_n not between 5 and 120 then raise exception '5–120 dakika arası uzatabilirsiniz.'; end if;
   dkd_end:=greatest(now(),dkd_session.expected_end_at)+make_interval(mins=>dkd_n);
   update db_style.db_style_calendar_entries set ends_at=dkd_end where reference_id=dkd_id and active;
   update db_style.db_style_service_sessions set expected_end_at=dkd_end where id=dkd_id;
   update db_style.db_style_staff_status set expected_return_at=dkd_end,updated_at=now() where staff_id=dkd_staff;
  elsif dkd_action='finish_session' then
   if dkd_session.state='completed' then return jsonb_build_object('id',dkd_id,'total_cents',dkd_session.total_cents); end if;
   if dkd_session.state<>'active' then raise exception 'Bu işlem tamamlanamaz.'; end if;
   dkd_price:=coalesce((dkd_payload->>'service_cents')::bigint,dkd_session.quoted_service_cents);
   if dkd_price<0 or dkd_price>100000000 then raise exception 'Geçersiz hizmet tutarı.'; end if;
   if dkd_price<>dkd_session.quoted_service_cents then
    if not db_style.db_style_can_manage(dkd_business) and not exists(select 1 from db_style.db_style_business_members where business_id=dkd_business and user_id=dkd_uid and staff_id=dkd_staff and active and can_edit_prices) then raise exception 'Fiyat değiştirme yetkiniz yok.'; end if;
    if not db_style.db_style_can_manage(dkd_business) and abs(dkd_price-dkd_session.quoted_service_cents)*10000>dkd_session.quoted_service_cents*(select price_edit_limit_bps from db_style.db_style_businesses where id=dkd_business) then raise exception 'Fiyat değişikliği işletme limitini aşıyor.'; end if;
    if (select price_reason_required from db_style.db_style_businesses where id=dkd_business) and dkd_reason is null then raise exception 'Fiyat değişikliği nedenini yazın.'; end if;
   end if;
   dkd_fee:=dkd_session.quoted_fee_cents; -- fixed snapshot, including every walk-in.
   dkd_period:=db_style.db_style_period(dkd_business,now());
   update db_style.db_style_service_sessions set state='completed',completed_at=now(),service_cents=dkd_price,fee_cents=dkd_fee,total_cents=dkd_price+dkd_fee,discount_cents=greatest(0,normal_price_cents-dkd_price),price_reason=dkd_reason,
    service_payment_status=case when coalesce((dkd_payload->>'paid')::boolean,false) then 'paid' else 'unpaid' end,service_payment_method=case when coalesce((dkd_payload->>'paid')::boolean,false) then coalesce(dkd_payload->>'payment_method','cash') end where id=dkd_id;
   insert into db_style.db_style_platform_fee_ledger(business_id,session_id,period_id,amount_cents,kind) values(dkd_business,dkd_id,dkd_period,dkd_fee,'charge');
   if coalesce((dkd_payload->>'paid')::boolean,false) then insert into db_style.db_style_service_payment_events(business_id,session_id,amount_cents,method) values(dkd_business,dkd_id,dkd_price+dkd_fee,coalesce(dkd_payload->>'payment_method','cash')); end if;
   update db_style.db_style_calendar_entries set active=false where reference_id=dkd_id;
   update db_style.db_style_staff_status set status='completed',expected_return_at=null,updated_at=now() where staff_id=dkd_staff;
   if dkd_session.appointment_id is not null then
    update db_style.db_style_appointments set status='completed',updated_at=now() where id=dkd_session.appointment_id;
    update db_style.db_style_appointment_locations set shared=false,latitude=null,longitude=null where appointment_id=dkd_session.appointment_id;
   end if;
   select user_id into dkd_member from db_style.db_style_customers where id=dkd_session.customer_id;
   perform db_style.db_style_notify(dkd_member,dkd_business,'İşleminiz tamamlandı','Deneyiminizi değerlendirebilir ve sonraki randevunuzu oluşturabilirsiniz.','completed',dkd_id);
   perform db_style.db_style_release_waitlist(dkd_staff,now(),dkd_session.expected_end_at);
  elsif dkd_action='reverse_session' then
   if not db_style.db_style_can_manage(dkd_business) or dkd_session.state<>'completed' or dkd_reason is null then raise exception 'Yetkili işletme yöneticisi geçerli neden ile tamamlanmış işlemi ters kayda alabilir.'; end if;
   insert into db_style.db_style_session_reversals(business_id,session_id,service_cents,fee_cents,reason,created_by) values(dkd_business,dkd_id,dkd_session.service_cents,dkd_session.fee_cents,dkd_reason,dkd_uid);
   insert into db_style.db_style_platform_fee_ledger(business_id,session_id,period_id,amount_cents,kind,reversal_of) select business_id,session_id,period_id,-amount_cents,'reversal',id from db_style.db_style_platform_fee_ledger where session_id=dkd_id and kind='charge';
   update db_style.db_style_service_sessions set state='reversed' where id=dkd_id;
  else
   if dkd_session.state<>'completed' or dkd_session.service_payment_status='paid' then raise exception 'Tamamlanmış ve ödenmemiş bir işlem seçin.'; end if;
   insert into db_style.db_style_service_payment_events(business_id,session_id,amount_cents,method) values(dkd_business,dkd_id,dkd_session.total_cents,coalesce(dkd_payload->>'payment_method','cash'));
   update db_style.db_style_service_sessions set service_payment_status='paid',service_payment_method=coalesce(dkd_payload->>'payment_method','cash') where id=dkd_id;
  end if;
  dkd_result:=jsonb_build_object('id',dkd_id,'total_cents',coalesce(dkd_price+dkd_fee,dkd_session.total_cents));
 elsif dkd_action='staff_status' then
  if not db_style.db_style_can_staff(dkd_business,dkd_staff) then raise exception 'Usta durumu yetkiniz yok.' using errcode='42501'; end if;
  perform 1 from db_style.db_style_staff where id=dkd_staff and business_id=dkd_business for update;
  dkd_state:=dkd_payload->>'status';
  if dkd_state not in ('available','waiting','break','busy','off') then raise exception 'Bu durum işlem akışı üzerinden değiştirilir.'; end if;
  if exists(select 1 from db_style.db_style_service_sessions where staff_id=dkd_staff and state='active') then raise exception 'Önce aktif tıraşı tamamlayın.'; end if;
  dkd_end:=nullif(dkd_payload->>'return_at','')::timestamptz;
  if dkd_state in ('break','busy') and (dkd_end is null or dkd_end<=now()) then raise exception 'Tahmini dönüş saatini belirtin.'; end if;
  update db_style.db_style_staff_status set status=dkd_state,expected_return_at=dkd_end,updated_at=now() where staff_id=dkd_staff;
  for dkd_other in select id,customer_user_id from db_style.db_style_appointments where staff_id=dkd_staff and status='booked' and starts_at>=now() and starts_at<coalesce(dkd_end,now()) loop
   perform db_style.db_style_notify(dkd_other.customer_user_id,dkd_business,'Ustanız geçici olarak meşgul','Randevunuz korunuyor. Ustanızla sohbetten yeni saat planlayabilirsiniz.','busy',dkd_other.id);
  end loop;
  dkd_result:=jsonb_build_object('id',dkd_staff);
 elsif dkd_action in ('waitlist_join','extra_request') then
  if not db_style.db_style_public_business(dkd_business) or not exists(select 1 from db_style.db_style_staff_services where business_id=dkd_business and staff_id=dkd_staff and service_id=dkd_service) then raise exception 'Usta ve hizmet eşleşmiyor.'; end if;
  if dkd_action='waitlist_join' then
   insert into db_style.db_style_waitlists(business_id,staff_id,service_id,user_id,range_start,range_end) values(dkd_business,dkd_staff,dkd_service,dkd_uid,dkd_at,(dkd_payload->>'ends_at')::timestamptz) returning id into dkd_id;
  else
   insert into db_style.db_style_extra_slot_requests(business_id,staff_id,service_id,user_id,requested_at,message) values(dkd_business,dkd_staff,dkd_service,dkd_uid,dkd_at,coalesce(dkd_payload->>'message','')) returning id into dkd_id;
   perform db_style.db_style_notify_team(dkd_business,dkd_staff,'Ekstra saat talebi',coalesce(dkd_payload->>'message',''), 'extra',dkd_id);
  end if;
  dkd_result:=jsonb_build_object('id',dkd_id);
 elsif dkd_action in ('extra_offer','extra_reject') then
  select * into dkd_request from db_style.db_style_extra_slot_requests where id=dkd_id for update;
  dkd_business:=dkd_request.business_id; dkd_staff:=dkd_request.staff_id;
  if dkd_request.id is null or not db_style.db_style_can_staff(dkd_business,dkd_staff) or dkd_request.state not in ('pending','offered') then raise exception 'Bu talebi yönetemezsiniz.'; end if;
  perform 1 from db_style.db_style_staff where id=dkd_staff for update;
  update db_style.db_style_calendar_entries set active=false where reference_id=dkd_id;
  if dkd_action='extra_offer' then
   if dkd_at<=now() then raise exception 'Gelecekte bir saat önerin.'; end if;
   select duration_minutes into dkd_duration from db_style.db_style_services where id=dkd_request.service_id;
   dkd_end:=dkd_at+make_interval(mins=>dkd_duration);
   insert into db_style.db_style_calendar_entries(business_id,staff_id,starts_at,ends_at,kind,reference_id,expires_at) values(dkd_business,dkd_staff,dkd_at,dkd_end,'hold',dkd_id,now()+interval '15 minutes');
   update db_style.db_style_extra_slot_requests set state='offered',offered_at=dkd_at,hold_expires_at=now()+interval '15 minutes' where id=dkd_id;
   perform db_style.db_style_notify(dkd_request.user_id,dkd_business,'Ustanız saat önerdi','Önerilen saat: '||to_char(dkd_at at time zone 'Europe/Istanbul','DD.MM HH24:MI')||'. 15 dakika içinde onaylayın.','extra',dkd_id);
  else
   update db_style.db_style_extra_slot_requests set state='rejected' where id=dkd_id;
   perform db_style.db_style_notify(dkd_request.user_id,dkd_business,'Ekstra saat talebi','Ustanız bu saat için uygunluk sağlayamadı.','extra',dkd_id);
  end if;
  dkd_result:=jsonb_build_object('id',dkd_id);
 elsif dkd_action in ('queue_add','queue_call','queue_cancel') then
  if dkd_action='queue_add' then
   if not db_style.db_style_can_staff(dkd_business,dkd_staff) then raise exception 'Sıra yönetimi yetkiniz yok.'; end if;
   if dkd_customer is null then insert into db_style.db_style_customers(business_id,name) values(dkd_business,coalesce(nullif(trim(dkd_payload->>'name'),''),'Misafir Müşteri')) returning id into dkd_customer; end if;
   insert into db_style.db_style_walkin_queue(business_id,staff_id,service_id,customer_id) values(dkd_business,dkd_staff,dkd_service,dkd_customer) returning id into dkd_id;
  else
   select business_id,staff_id,customer_id into dkd_business,dkd_staff,dkd_customer from db_style.db_style_walkin_queue where id=dkd_id;
   if not db_style.db_style_can_staff(dkd_business,dkd_staff) then raise exception 'Sıra yönetimi yetkiniz yok.'; end if;
   update db_style.db_style_walkin_queue set state=case when dkd_action='queue_call' then 'called' else 'cancelled' end where id=dkd_id and state in ('waiting','called');
   if dkd_action='queue_call' then select user_id into dkd_member from db_style.db_style_customers where id=dkd_customer; perform db_style.db_style_notify(dkd_member,dkd_business,'Sıranız geldi','Ustanız sizi bekliyor.','queue',dkd_id); end if;
  end if;
  dkd_result:=jsonb_build_object('id',dkd_id);
 elsif dkd_action='chat_open' then
  if dkd_payload->>'appointment_id' is not null then select * into dkd_a from db_style.db_style_appointments where id=(dkd_payload->>'appointment_id')::uuid;
   if not(dkd_a.customer_user_id=dkd_uid or db_style.db_style_can_staff(dkd_a.business_id,dkd_a.staff_id)) then raise exception 'Sohbet yetkiniz yok.'; end if;
   dkd_staff:=dkd_a.staff_id; dkd_business:=dkd_a.business_id; dkd_member:=dkd_a.customer_user_id;
  else dkd_member:=dkd_uid; end if;
  if dkd_member is null or not exists(select 1 from db_style.db_style_staff where id=dkd_staff and business_id=dkd_business and active) then raise exception 'Sohbet için kayıtlı müşteri ve aktif usta gerekli.'; end if;
  insert into db_style.db_style_chat_conversations(business_id,staff_id,customer_user_id,appointment_id) values(dkd_business,dkd_staff,dkd_member,dkd_a.id)
   on conflict(staff_id,customer_user_id) do update set appointment_id=coalesce(excluded.appointment_id,db_style.db_style_chat_conversations.appointment_id) returning id into dkd_id;
  dkd_result:=jsonb_build_object('id',dkd_id);
 elsif dkd_action in ('message_send','chat_read','chat_block') then
  if not db_style.db_style_conversation_access(dkd_id) then raise exception 'Sohbet erişimi reddedildi.' using errcode='42501'; end if;
  select * into dkd_conversation from db_style.db_style_chat_conversations where id=dkd_id;
  dkd_business:=dkd_conversation.business_id;
  if dkd_action='message_send' then
   if exists(select 1 from db_style.db_style_chat_blocks where conversation_id=dkd_id) then raise exception 'Bu sohbet engellenmiş.'; end if;
   insert into db_style.db_style_chat_messages(business_id,conversation_id,sender_id,body) values(dkd_business,dkd_id,dkd_uid,trim(dkd_payload->>'body')) returning id into dkd_receipt;
   if dkd_conversation.customer_user_id=dkd_uid then perform db_style.db_style_notify_team(dkd_business,dkd_conversation.staff_id,'Yeni mesaj',left(dkd_payload->>'body',100),'message',dkd_id);
   else perform db_style.db_style_notify(dkd_conversation.customer_user_id,dkd_business,'Ustanızdan mesaj',left(dkd_payload->>'body',100),'message',dkd_id); end if;
  elsif dkd_action='chat_read' then update db_style.db_style_chat_messages set read_at=now() where conversation_id=dkd_id and sender_id<>dkd_uid and read_at is null;
  else
   if coalesce((dkd_payload->>'blocked')::boolean,true) then insert into db_style.db_style_chat_blocks(user_id,conversation_id) values(dkd_uid,dkd_id) on conflict do nothing;
   else delete from db_style.db_style_chat_blocks where user_id=dkd_uid and conversation_id=dkd_id; end if;
  end if;
  dkd_result:=jsonb_build_object('id',coalesce(dkd_receipt,dkd_id));
 elsif dkd_action='message_report' then
  select conversation_id into dkd_receipt from db_style.db_style_chat_messages where id=dkd_id;
  if not db_style.db_style_conversation_access(dkd_receipt) then raise exception 'Mesaj erişimi reddedildi.'; end if;
  insert into db_style.db_style_message_reports(user_id,message_id,reason) values(dkd_uid,dkd_id,coalesce(dkd_reason,'Uygunsuz mesaj'));
  dkd_result:=jsonb_build_object('reported',true);
 elsif dkd_action='location_update' then
  select * into dkd_a from db_style.db_style_appointments where id=dkd_id for update;
  if dkd_a.id is null or dkd_a.customer_user_id is distinct from dkd_uid then raise exception 'Konum yalnızca kendi aktif randevunuz için paylaşılabilir.'; end if;
  dkd_business:=dkd_a.business_id;
  if coalesce((dkd_payload->>'shared')::boolean,false) then
   if dkd_a.status not in ('booked','arrived') then raise exception 'Tamamlanan veya iptal edilen randevuda konum paylaşılamaz.'; end if;
   if not coalesce((dkd_payload->>'grant_consent')::boolean,false) and not exists(select 1 from db_style.db_style_appointment_locations where appointment_id=dkd_id and shared and expires_at>now()) then raise exception 'Konum paylaşımı için açık onay gerekli.'; end if;
   if dkd_a.starts_at>now()+interval '2 hours' or dkd_a.ends_at<now() then raise exception 'Konum paylaşımı randevuya 2 saat kala başlayabilir.'; end if;
   insert into db_style.db_style_appointment_locations(appointment_id,business_id,user_id,consent_at,latitude,longitude,accuracy_meters,eta_minutes,arrival_state,expires_at)
    values(dkd_id,dkd_business,dkd_uid,now(),(dkd_payload->>'latitude')::numeric,(dkd_payload->>'longitude')::numeric,(dkd_payload->>'accuracy_meters')::numeric,(dkd_payload->>'eta_minutes')::int,coalesce(dkd_payload->>'arrival_state','on_way'),dkd_a.ends_at+interval '30 minutes')
    on conflict(appointment_id) do update set latitude=excluded.latitude,longitude=excluded.longitude,accuracy_meters=excluded.accuracy_meters,eta_minutes=excluded.eta_minutes,arrival_state=excluded.arrival_state,shared=true,updated_at=now(),expires_at=excluded.expires_at;
  else update db_style.db_style_appointment_locations set shared=false,latitude=null,longitude=null,updated_at=now() where appointment_id=dkd_id; end if;
  dkd_result:=jsonb_build_object('id',dkd_id);
 elsif dkd_action in ('payment_plan','plan_approve') then
  if dkd_action='plan_approve' then
   if not db_style.db_style_is_admin() then raise exception 'Admin yetkisi gerekli.' using errcode='42501'; end if;
   update db_style.db_style_payment_plans set approved=true,approved_by=dkd_uid where business_id=dkd_business;
  else
   if not db_style.db_style_can_manage(dkd_business) then raise exception 'Ödeme planı yetkiniz yok.'; end if;
   insert into db_style.db_style_payment_plans(business_id,cadence,day_number) values(dkd_business,dkd_payload->>'cadence',(dkd_payload->>'day_number')::int)
    on conflict(business_id) do update set cadence=excluded.cadence,day_number=excluded.day_number,approved=false,approved_by=null,requested_at=now();
  end if;
  dkd_result:=jsonb_build_object('id',dkd_business);
 elsif dkd_action='payment_claim' then
  if not db_style.db_style_can_manage(dkd_business) then raise exception 'Ödeme bildirimi yetkiniz yok.'; end if;
  dkd_period:=(dkd_payload->>'period_id')::uuid; dkd_amount:=(dkd_payload->>'amount_cents')::bigint;
  if dkd_payload->>'receipt_path' is not null and split_part(dkd_payload->>'receipt_path','/',1)<>dkd_business::text then raise exception 'Dekont bu işletmeye ait olmalı.'; end if;
  if not exists(select 1 from db_style.db_style_payment_periods where id=dkd_period and business_id=dkd_business) then raise exception 'Ödeme dönemi geçersiz.'; end if;
  insert into db_style.db_style_payment_claims(business_id,period_id,amount_cents,method,paid_at,receipt_path,explanation,submitted_by)
   values(dkd_business,dkd_period,dkd_amount,dkd_payload->>'method',(dkd_payload->>'paid_at')::timestamptz,dkd_payload->>'receipt_path',coalesce(dkd_payload->>'explanation',''),dkd_uid) returning id into dkd_id;
  for dkd_member in select user_id from db_style.db_style_admin_users where active loop perform db_style.db_style_notify(dkd_member,dkd_business,'Ödeme bildirimi','İşletme ödemesi onay bekliyor.','payment',dkd_id); end loop;
  dkd_result:=jsonb_build_object('id',dkd_id);
 elsif dkd_action in ('payment_approve','payment_reject') then
  if not db_style.db_style_is_admin() then raise exception 'Ödeme onayı yalnızca Admin tarafından yapılabilir.' using errcode='42501'; end if;
  select * into dkd_claim from db_style.db_style_payment_claims where id=dkd_id for update;
  if dkd_claim.id is null or dkd_claim.state<>'pending' then raise exception 'Ödeme bildirimi zaten incelenmiş.'; end if;
  dkd_business:=dkd_claim.business_id;
  perform 1 from db_style.db_style_businesses where id=dkd_business for update;
  perform 1 from db_style.db_style_payment_periods where id=dkd_claim.period_id for update;
  if dkd_action='payment_approve' then
   select coalesce((select sum(amount_cents) from db_style.db_style_platform_fee_ledger where period_id=dkd_claim.period_id),0)-coalesce((select sum(amount_cents) from db_style.db_style_payment_allocations where period_id=dkd_claim.period_id),0) into dkd_remaining;
   if dkd_claim.amount_cents>dkd_remaining then raise exception 'Ödeme tutarı bu dönemin kalan borcunu aşıyor.'; end if;
   insert into db_style.db_style_payment_receipts(business_id,claim_id,amount_cents,confirmed_by) values(dkd_business,dkd_id,dkd_claim.amount_cents,dkd_uid) returning id into dkd_receipt;
   insert into db_style.db_style_payment_allocations(business_id,receipt_id,period_id,amount_cents) values(dkd_business,dkd_receipt,dkd_claim.period_id,dkd_claim.amount_cents);
  elsif dkd_reason is null then raise exception 'Red nedenini yazın.'; end if;
  update db_style.db_style_payment_claims set state=case when dkd_action='payment_approve' then 'approved' else 'rejected' end,reviewed_by=dkd_uid,reviewed_at=now(),review_reason=dkd_reason where id=dkd_id;
  perform db_style.db_style_notify_team(dkd_business,null,'Platform ödemeniz incelendi',case when dkd_action='payment_approve' then 'Ödemeniz onaylandı ve kalan borcunuz güncellendi.' else coalesce(dkd_reason,'') end,'payment',dkd_id);
  dkd_result:=jsonb_build_object('id',dkd_id);
 elsif dkd_action='fee_rule' then
  if not db_style.db_style_is_admin() then raise exception 'Hizmet bedeli değişikliği Admin yetkisi gerektirir.'; end if;
  insert into db_style.db_style_platform_fee_rules(business_id,staff_id,service_id,fee_cents,fee_bps,valid_from,created_by)
   values(dkd_business,dkd_staff,dkd_service,(dkd_payload->>'fee_cents')::bigint,coalesce((dkd_payload->>'fee_bps')::int,0),coalesce(nullif(dkd_payload->>'valid_from','')::timestamptz,now()),dkd_uid) returning id into dkd_id;
  dkd_result:=jsonb_build_object('id',dkd_id);
 elsif dkd_action='promo_save' then
  if not db_style.db_style_can_staff(dkd_business,dkd_staff) then raise exception 'Kod yönetimi yetkiniz yok.'; end if;
  dkd_n:=(dkd_payload->>'discount_bps')::int;
  if not db_style.db_style_can_manage(dkd_business) and dkd_n>(select price_edit_limit_bps from db_style.db_style_businesses where id=dkd_business) then raise exception 'İndirim işletme limitini aşıyor.'; end if;
  insert into db_style.db_style_promo_codes(business_id,staff_id,code,discount_bps,applies_to,expires_at,max_uses) values(dkd_business,dkd_staff,upper(trim(dkd_payload->>'code')),dkd_n,coalesce(dkd_payload->>'applies_to','service'),nullif(dkd_payload->>'expires_at','')::timestamptz,nullif(dkd_payload->>'max_uses','')::int) returning id into dkd_id;
  dkd_result:=jsonb_build_object('id',dkd_id);
 elsif dkd_action='promo_redeem' then
  select * into dkd_other from db_style.db_style_promo_codes where code=upper(trim(dkd_payload->>'code')) and active and (expires_at is null or expires_at>now()) for update;
  if not found or (dkd_other.max_uses is not null and dkd_other.uses>=dkd_other.max_uses) then raise exception 'Kod geçersiz veya süresi dolmuş.'; end if;
  dkd_business:=dkd_other.business_id; dkd_staff:=dkd_other.staff_id;
  insert into db_style.db_style_customers(business_id,user_id,name,favorite_staff_id) select dkd_business,dkd_uid,display_name,dkd_staff from db_style.db_style_profiles where user_id=dkd_uid
   on conflict(business_id,user_id) do update set favorite_staff_id=excluded.favorite_staff_id returning id into dkd_customer;
  insert into db_style.db_style_customer_discounts(business_id,customer_id,staff_id,discount_bps,promo_code_id) values(dkd_business,dkd_customer,dkd_staff,dkd_other.discount_bps,dkd_other.id)
   on conflict(customer_id,staff_id) do update set discount_bps=excluded.discount_bps,promo_code_id=excluded.promo_code_id;
  dkd_result:=jsonb_build_object('id',dkd_other.id,'staff_id',dkd_staff);
 elsif dkd_action='customer_discount' then
  if not db_style.db_style_can_staff(dkd_business,dkd_staff) or not db_style.db_style_customer_access(dkd_business,dkd_customer) then raise exception 'Müşteri indirimi yetkiniz yok.'; end if;
  dkd_n:=coalesce((dkd_payload->>'discount_bps')::int,0);
  if not db_style.db_style_can_manage(dkd_business) and (dkd_n>(select price_edit_limit_bps from db_style.db_style_businesses where id=dkd_business) or dkd_payload->>'fixed_price_cents' is not null) then raise exception 'Özel fiyat işletme sahibi onayı gerektirir.'; end if;
  insert into db_style.db_style_customer_discounts(business_id,customer_id,staff_id,discount_bps,fixed_price_cents) values(dkd_business,dkd_customer,dkd_staff,dkd_n,nullif(dkd_payload->>'fixed_price_cents','')::bigint)
   on conflict(customer_id,staff_id) do update set discount_bps=excluded.discount_bps,fixed_price_cents=excluded.fixed_price_cents;
  dkd_result:=jsonb_build_object('id',dkd_customer);
 elsif dkd_action in ('customer_note','customer_consent') then
  if dkd_action='customer_consent' then update db_style.db_style_customers set preferences_consent=coalesce((dkd_payload->>'consent')::boolean,false) where id=dkd_customer and user_id=dkd_uid;
   if not found then raise exception 'Müşteri onayı yalnızca kendisi tarafından verilir.'; end if;
  else
   if not db_style.db_style_can_staff(dkd_business,dkd_staff) or not db_style.db_style_customer_access(dkd_business,dkd_customer) then raise exception 'Müşteri notu yetkiniz yok.'; end if;
   if not exists(select 1 from db_style.db_style_customers where id=dkd_customer and preferences_consent) then raise exception 'Müşteri tercihlerini saklamak için müşteri onayı gerekli.'; end if;
   insert into db_style.db_style_customer_notes(business_id,customer_id,staff_id,note,created_by) values(dkd_business,dkd_customer,dkd_staff,trim(dkd_payload->>'note'),dkd_uid) returning id into dkd_id;
  end if;
  dkd_result:=jsonb_build_object('id',coalesce(dkd_id,dkd_customer));
 elsif dkd_action='review' then
  select * into dkd_session from db_style.db_style_service_sessions where id=dkd_id;
  if dkd_session.state<>'completed' or not exists(select 1 from db_style.db_style_customers where id=dkd_session.customer_id and user_id=dkd_uid) then raise exception 'Yalnızca kendi tamamlanmış işleminizi değerlendirebilirsiniz.'; end if;
  dkd_business:=dkd_session.business_id;
  insert into db_style.db_style_reviews(business_id,staff_id,session_id,user_id,rating,comment) values(dkd_business,dkd_session.staff_id,dkd_id,dkd_uid,(dkd_payload->>'rating')::int,coalesce(dkd_payload->>'comment',''));
  dkd_result:=jsonb_build_object('id',dkd_id);
 elsif dkd_action='favorite' then
  if coalesce((dkd_payload->>'enabled')::boolean,true) then insert into db_style.db_style_favorites(user_id,business_id) values(dkd_uid,dkd_business) on conflict do nothing;
  else delete from db_style.db_style_favorites where user_id=dkd_uid and business_id=dkd_business; end if;
  dkd_result:=jsonb_build_object('id',dkd_business);
 elsif dkd_action='notification_read' then
  update db_style.db_style_notifications set read_at=now() where user_id=dkd_uid and (dkd_id is null or id=dkd_id);
  dkd_result:=jsonb_build_object('saved',true);
 elsif dkd_action='push_token' then
  if (dkd_payload->>'token') is null or (dkd_payload->>'token') !~ '^(ExponentPushToken|ExpoPushToken)\[[A-Za-z0-9_-]+\]$' then raise exception 'Push cihaz kimliği geçersiz.'; end if;
  update db_style.db_style_push_tokens set active=false where token=dkd_payload->>'token' and user_id<>dkd_uid;
  insert into db_style.db_style_push_tokens(user_id,token) values(dkd_uid,dkd_payload->>'token') on conflict(user_id,token) do update set active=true,updated_at=now();
  dkd_result:=jsonb_build_object('saved',true);
 elsif dkd_action='push_token_remove' then
  update db_style.db_style_push_tokens set active=false,updated_at=now() where user_id=dkd_uid and token=dkd_payload->>'token';
  dkd_result:=jsonb_build_object('saved',true);
 elsif dkd_action='settings_save' then
  if not db_style.db_style_is_admin() then raise exception 'Admin yetkisi gerekli.'; end if;
  if dkd_payload->>'key'<>'payment_instructions' then raise exception 'Ayar anahtarı geçersiz.'; end if;
  update db_style.db_style_app_settings set value=dkd_payload->'value',updated_at=now() where key=dkd_payload->>'key';
  dkd_result:=jsonb_build_object('saved',true);
 elsif dkd_action in ('loyalty_save','campaign') then
  if not db_style.db_style_can_manage(dkd_business) then raise exception 'İşletme yönetimi yetkiniz yok.'; end if;
  if dkd_action='loyalty_save' then insert into db_style.db_style_loyalty_programs(business_id,visits_required,reward_bps,active) values(dkd_business,(dkd_payload->>'visits_required')::int,(dkd_payload->>'reward_bps')::int,coalesce((dkd_payload->>'active')::boolean,true)) on conflict(business_id) do update set visits_required=excluded.visits_required,reward_bps=excluded.reward_bps,active=excluded.active;
  else
   insert into db_style.db_style_campaigns(business_id,title,message,created_by) values(dkd_business,dkd_payload->>'title',dkd_payload->>'message',dkd_uid) returning id into dkd_id;
   for dkd_member in select distinct user_id from db_style.db_style_customers where business_id=dkd_business and user_id is not null and preferences_consent loop perform db_style.db_style_notify(dkd_member,dkd_business,dkd_payload->>'title',dkd_payload->>'message','campaign',dkd_id); end loop;
  end if;
  dkd_result:=jsonb_build_object('saved',true);
 elsif dkd_action in ('demo_load','demo_remove') then
  if not db_style.db_style_is_admin() then raise exception 'Demo yönetimi Admin yetkisi gerektirir.'; end if;
  dkd_result:=db_style.db_style_demo(dkd_action,dkd_payload);
 else raise exception 'Desteklenmeyen işlem: %',dkd_action;
 end if;
 perform db_style.db_style_audit(dkd_business,dkd_action,coalesce(dkd_id,dkd_staff,dkd_business),dkd_payload - 'body' - 'note' - 'latitude' - 'longitude' - 'phone' - 'member_email');
 insert into db_style.db_style_idempotency_keys(user_id,key,action,payload_hash,result) values(dkd_uid,dkd_key,dkd_action,dkd_hash,dkd_result);
 return dkd_result;
exception when exclusion_violation then raise exception 'Seçtiğiniz saat başka bir randevu veya işlemle çakışıyor. Başka saat seçin.' using errcode='23P01';
end $$;
notify pgrst,'reload schema';
