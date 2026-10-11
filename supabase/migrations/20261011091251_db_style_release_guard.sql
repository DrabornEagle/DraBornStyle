create or replace function db_style.db_style_quote(dkd_business uuid,dkd_staff uuid,dkd_service uuid,dkd_customer uuid default null,dkd_code text default null) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare dkd_base bigint; dkd_discount bigint:=0; dkd_price bigint; dkd_fee bigint; dkd_bps int:=0; dkd_fixed bigint; dkd_promo db_style.db_style_promo_codes; dkd_apply text:='service'; begin
 select price_cents into dkd_base from db_style.db_style_services s where s.id=dkd_service and s.business_id=dkd_business and s.active and exists(select 1 from db_style.db_style_staff_services x where x.service_id=s.id and x.staff_id=dkd_staff);
 if dkd_base is null then raise exception 'Hizmet bu usta için kullanılamıyor.'; end if;
 if dkd_customer is not null then
  select d.discount_bps,d.fixed_price_cents into dkd_bps,dkd_fixed from db_style.db_style_customer_discounts d left join db_style.db_style_promo_codes p on p.id=d.promo_code_id
   where d.customer_id=dkd_customer and d.staff_id=dkd_staff and (d.promo_code_id is null or (p.active and (p.expires_at is null or p.expires_at>now())));
  select coalesce(p.applies_to,'service') into dkd_apply from db_style.db_style_customer_discounts d left join db_style.db_style_promo_codes p on p.id=d.promo_code_id where d.customer_id=dkd_customer and d.staff_id=dkd_staff;
  dkd_apply:=coalesce(dkd_apply,'service');
  select greatest(coalesce(dkd_bps,0),coalesce((select l.reward_bps from db_style.db_style_loyalty_programs l where l.business_id=dkd_business and l.active and not exists(select 1 from db_style.db_style_appointments a where a.customer_id=dkd_customer and a.status in ('booked','arrived','in_progress') and a.quoted_discount_cents>0 and a.promo_code_id is null) and
   (select count(*) from db_style.db_style_service_sessions s where s.customer_id=dkd_customer and s.state='completed')>0 and
   (select count(*) from db_style.db_style_service_sessions s where s.customer_id=dkd_customer and s.state='completed')%l.visits_required=0),0)) into dkd_bps;
 end if;
 if nullif(trim(dkd_code),'') is not null then
  select * into dkd_promo from db_style.db_style_promo_codes where upper(code)=upper(trim(dkd_code)) and business_id=dkd_business and staff_id=dkd_staff and active and (expires_at is null or expires_at>now()) and (max_uses is null or uses<max_uses);
  if dkd_promo.id is null then raise exception 'Kod bu işletme ve usta için geçerli değil.'; end if;
  dkd_bps:=greatest(coalesce(dkd_bps,0),dkd_promo.discount_bps); dkd_apply:=dkd_promo.applies_to;
 end if;
 dkd_price:=coalesce(dkd_fixed,dkd_base-(dkd_base*coalesce(dkd_bps,0)+5000)/10000);
 dkd_price:=least(dkd_base,greatest(0,dkd_price)); dkd_fee:=coalesce(db_style.db_style_fee(dkd_business,dkd_staff,dkd_service,dkd_price),2000);
 if dkd_apply='total' then dkd_price:=greatest(0,dkd_price-(dkd_fee*coalesce(dkd_bps,0)+5000)/10000); end if;
 dkd_discount:=dkd_base-dkd_price;
 return jsonb_build_object('base_cents',dkd_base,'discount_cents',dkd_discount,'service_cents',dkd_price,'fee_cents',dkd_fee,'total_cents',dkd_price+dkd_fee,'promo_id',dkd_promo.id);
end $$;
-- This previously verified existing Auth identity is the initial platform administrator.
-- Runtime authorization checks the protected UUID table, never email/user_metadata.
insert into db_style.db_style_admin_users(user_id)
select id from auth.users where id='3a4fc5c8-b296-475d-a800-8cdda577618e'::uuid and lower(email)='draborneagle@gmail.com'
on conflict(user_id) do nothing;
notify pgrst,'reload schema';
