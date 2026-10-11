-- Staff see their own immutable movement records; owner/admin retain finance access.
create policy db_style_fee_own_staff on db_style.db_style_platform_fee_ledger for select to authenticated using (
 exists(select 1 from db_style.db_style_service_sessions s where s.id=session_id and db_style.db_style_can_staff(s.business_id,s.staff_id)));
create policy db_style_reversal_own_staff on db_style.db_style_session_reversals for select to authenticated using (
 exists(select 1 from db_style.db_style_service_sessions s where s.id=session_id and db_style.db_style_can_staff(s.business_id,s.staff_id)));
create policy db_style_service_payment_own_staff on db_style.db_style_service_payment_events for select to authenticated using (
 exists(select 1 from db_style.db_style_service_sessions s where s.id=session_id and db_style.db_style_can_staff(s.business_id,s.staff_id)));
-- Reports retain RLS and never multiply a receipt by a staff/service join.
create or replace function db_style.db_style_report(dkd_filters jsonb) returns jsonb
language sql stable security invoker set search_path='' as $$
with limits as (
 select nullif(dkd_filters->>'business_id','')::uuid business_id,
 nullif(dkd_filters->>'staff_id','')::uuid staff_id,
 nullif(dkd_filters->>'service_id','')::uuid service_id,
 coalesce(nullif(dkd_filters->>'from','')::timestamptz,'2000-01-01'::timestamptz) starts,
 coalesce(nullif(dkd_filters->>'to','')::timestamptz,'2100-01-01'::timestamptz) ends
), visible as materialized (
 select s.* from db_style.db_style_service_sessions s,limits p
 where (p.business_id is null or s.business_id=p.business_id)
 and (p.staff_id is null or s.staff_id=p.staff_id)
 and (p.service_id is null or s.service_id=p.service_id)
), current_sessions as materialized (
 select s.* from visible s,limits p where s.state='completed' and s.completed_at>=p.starts and s.completed_at<p.ends
), current_ledger as materialized (
 select l.*,s.staff_id,s.service_id from db_style.db_style_platform_fee_ledger l
 join visible s on s.id=l.session_id cross join limits p where l.created_at>=p.starts and l.created_at<p.ends
), service_moves as materialized (
 select s.id session_id,s.business_id,s.staff_id,s.service_id,s.completed_at occurred_at,s.service_cents amount_cents
 from visible s where s.state in ('completed','reversed')
 union all select s.id,s.business_id,s.staff_id,s.service_id,r.created_at,-r.service_cents
 from db_style.db_style_session_reversals r join visible s on s.id=r.session_id
), current_service_moves as materialized (
 select m.* from service_moves m,limits p where m.occurred_at>=p.starts and m.occurred_at<p.ends
), selected_staff as (
 select st.* from db_style.db_style_staff st,limits p
 where st.active and (p.business_id is null or st.business_id=p.business_id) and (p.staff_id is null or st.id=p.staff_id)
), dates as (
 select d::date as "day" from limits p,
 generate_series(greatest((p.starts at time zone 'Europe/Istanbul')::date,
 (now() at time zone 'Europe/Istanbul')::date-365)::timestamp,
 least(((p.ends-interval '1 microsecond') at time zone 'Europe/Istanbul')::date,(now() at time zone 'Europe/Istanbul')::date)::timestamp,interval '1 day') d
), work_windows as materialized (
 select st.id staff_id, greatest(p.starts,(d.day+w.a*interval '1 minute') at time zone 'Europe/Istanbul') opens,
 least(p.ends,(d.day+w.b*interval '1 minute') at time zone 'Europe/Istanbul') closes
 from selected_staff st cross join dates d cross join limits p
 join lateral (
 select h.* from db_style.db_style_working_hours h where h.branch_id=st.branch_id
 and (h.staff_id is null or h.staff_id=st.id) and h.weekday=extract(isodow from d.day)
 order by (h.staff_id is not null) desc limit 1
 ) h on not h.closed
 cross join lateral (values (h.open_minute,coalesce(h.break_start,h.close_minute)),(coalesce(h.break_end,h.close_minute),h.close_minute)) w(a,b)
 where w.b>w.a
), working as (
 select coalesce(sum(greatest(0,extract(epoch from closes-opens)/60)),0) capacity,
 coalesce(sum((select coalesce(sum(greatest(0,extract(epoch from least(s.completed_at,w.closes)-greatest(s.started_at,w.opens))/60)),0)
 from current_sessions s where s.staff_id=w.staff_id and s.started_at<w.closes and s.completed_at>w.opens)),0) occupied
 from work_windows w
), first_visits as (
 select s.business_id,s.customer_id,min(s.completed_at) first_visit
 from db_style.db_style_service_sessions s where s.state='completed' group by s.business_id,s.customer_id
), selected_customers as (
 select distinct s.business_id,s.customer_id from current_sessions s
), previous_limits as (
 select case when dkd_filters->>'period' in ('month','lastmonth') then starts-interval '1 month'
 when dkd_filters->>'period'='year' then starts-interval '1 year'
 else starts-least(ends-starts,interval '366 days') end starts,
 case when dkd_filters->>'period' in ('month','lastmonth') then ends-interval '1 month'
 when dkd_filters->>'period'='year' then ends-interval '1 year' else starts end ends from limits
), staff_rows as (
 select st.id,st.name,st.business_id,st.photo_url,st.target_monthly,
 (select count(*) from current_sessions s where s.staff_id=st.id) completed,
 coalesce((select sum(s.amount_cents) from current_service_moves s where s.staff_id=st.id),0) service_cents,
 coalesce((select sum(s.amount_cents) from current_ledger s where s.staff_id=st.id),0) fee_cents,
 coalesce((select round(avg(extract(epoch from s.completed_at-s.started_at)/60)) from current_sessions s where s.staff_id=st.id),0) avg_minutes,
 (select count(*) from current_sessions s where s.staff_id=st.id and s.source='app') app_customers,
 (select count(distinct customer_id) from current_sessions s where s.staff_id=st.id) unique_customers,
 coalesce((select avg(rating)::numeric(3,2) from db_style.db_style_reviews r where r.staff_id=st.id),0) rating,
 (select count(*) from db_style.db_style_service_sessions s where s.staff_id=st.id and s.state='completed'
 and s.completed_at>=date_trunc('month',now() at time zone 'Europe/Istanbul') at time zone 'Europe/Istanbul'
 and s.completed_at<(date_trunc('month',now() at time zone 'Europe/Istanbul')+interval '1 month') at time zone 'Europe/Istanbul') month_completed
 from selected_staff st
), business_rows as (
 select b.id,b.name,b.demo_batch_id,
 (select count(*) from current_sessions s where s.business_id=b.id) completed,
 (select count(*) from current_sessions s where s.business_id=b.id and s.source='app') app_count,
 coalesce((select sum(amount_cents) from current_service_moves s where s.business_id=b.id),0) service_cents,
 coalesce((select sum(amount_cents) from current_ledger l where l.business_id=b.id),0) fee_cents,
 coalesce((select sum(r.amount_cents) from db_style.db_style_payment_receipts r,limits p where r.business_id=b.id and r.confirmed_at>=p.starts and r.confirmed_at<p.ends),0) collected_cents,
 coalesce((select balance_cents from db_style.db_style_business_balances x where x.business_id=b.id and db_style.db_style_can_finance(b.id)),0) balance_cents
 from db_style.db_style_businesses b,limits p where b.active and (p.business_id is null or b.id=p.business_id)
)
select jsonb_build_object(
 'business_count',(select count(*) from business_rows),'staff_count',(select count(*) from selected_staff),
 'appointments',(select count(*) from db_style.db_style_appointments a,limits p where (p.business_id is null or a.business_id=p.business_id) and (p.staff_id is null or a.staff_id=p.staff_id) and (p.service_id is null or a.service_id=p.service_id) and a.starts_at>=p.starts and a.starts_at<p.ends),
 'cancelled',(select count(*) from db_style.db_style_appointments a,limits p where a.status='cancelled' and (p.business_id is null or a.business_id=p.business_id) and (p.staff_id is null or a.staff_id=p.staff_id) and (p.service_id is null or a.service_id=p.service_id) and a.starts_at>=p.starts and a.starts_at<p.ends),
 'no_show',(select count(*) from db_style.db_style_appointments a,limits p where a.status='no_show' and (p.business_id is null or a.business_id=p.business_id) and (p.staff_id is null or a.staff_id=p.staff_id) and (p.service_id is null or a.service_id=p.service_id) and a.starts_at>=p.starts and a.starts_at<p.ends),
 'completed',(select count(*) from current_sessions),
 'service_cents',coalesce((select sum(amount_cents) from current_service_moves),0),
 'fee_cents',coalesce((select sum(amount_cents) from current_ledger),0),
 'collected_cents',coalesce((select sum(amount_cents) from db_style.db_style_payment_receipts r,limits p where (p.business_id is null or r.business_id=p.business_id) and r.confirmed_at>=p.starts and r.confirmed_at<p.ends),0),
 'avg_minutes',coalesce((select round(avg(extract(epoch from completed_at-started_at)/60)) from current_sessions),0),
 'unique_customers',(select count(*) from selected_customers),
 'new_customers',(select count(*) from selected_customers c join first_visits f using(business_id,customer_id) cross join limits p where f.first_visit>=p.starts),
 'returning_customers',(select count(*) from selected_customers c join first_visits f using(business_id,customer_id) cross join limits p where f.first_visit<p.starts),
 'walkin_count',(select count(*) from current_sessions where source='walkin'),
 'capacity_minutes',(select round(capacity) from working),
 'busy_minutes',(select round(occupied) from working),
 'idle_minutes',(select round(greatest(capacity-occupied,0)) from working),
 'occupancy_percent',(select case when capacity>0 then least(100,round(100*occupied/capacity,1)) else 0 end from working),
 'occupancy_service_filtered',(select service_id is not null from limits),
 'previous',case when coalesce(dkd_filters->>'period','')='all' then null else jsonb_build_object(
 'completed',(select count(*) from visible s,previous_limits p where s.state='completed' and s.completed_at>=p.starts and s.completed_at<p.ends),
 'service_cents',coalesce((select sum(s.amount_cents) from service_moves s,previous_limits p where s.occurred_at>=p.starts and s.occurred_at<p.ends),0)) end,
 'daily',coalesce((select jsonb_agg(to_jsonb(x) order by x."day") from (
 select u."day",sum(u.count) count,sum(u.service_cents) service_cents,sum(u.fee_cents) fee_cents from (
 select (completed_at at time zone 'Europe/Istanbul')::date as "day",count(*) as count,0::numeric service_cents,0::numeric fee_cents from current_sessions group by 1
 union all select (occurred_at at time zone 'Europe/Istanbul')::date,0,sum(amount_cents),0 from current_service_moves group by 1
 union all select (created_at at time zone 'Europe/Istanbul')::date,0,0,sum(amount_cents) from current_ledger group by 1
 )u group by 1)x),'[]'),
 'hours',coalesce((select jsonb_agg(to_jsonb(x) order by x."hour") from(select extract(hour from started_at at time zone 'Europe/Istanbul')::int as "hour",count(*) as count from current_sessions group by 1)x),'[]'),
 'staff',coalesce((select jsonb_agg(to_jsonb(x) order by x.completed desc) from staff_rows x),'[]'),
 'businesses',coalesce((select jsonb_agg(to_jsonb(x) order by x.fee_cents desc) from business_rows x),'[]'),
 'services',coalesce((select jsonb_agg(to_jsonb(x) order by x.count desc) from(
 select v.id,v.name,(select count(*) from current_sessions s where s.service_id=v.id) count,
 coalesce((select sum(amount_cents) from current_service_moves s where s.service_id=v.id),0) service_cents
 from db_style.db_style_services v,limits p where (p.business_id is null or v.business_id=p.business_id) and (p.service_id is null or v.id=p.service_id))x),'[]'));
$$;
revoke all on function db_style.db_style_report(jsonb) from public,anon;
grant execute on function db_style.db_style_report(jsonb) to authenticated;
