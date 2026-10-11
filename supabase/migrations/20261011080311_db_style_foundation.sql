set local search_path=public,extensions;
-- DraBornStyle v0.1. Only db_style objects and db_style_* entrypoints.
create schema db_style;
grant usage on schema db_style to authenticated, anon, service_role;
alter default privileges in schema db_style revoke execute on functions from public;

create table db_style.db_style_profiles (
 user_id uuid primary key references auth.users(id), display_name text not null check(length(display_name) between 1 and 100),
 phone text, avatar_url text, preferred_role text not null default 'customer' check(preferred_role in ('customer','owner','staff')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table db_style.db_style_admin_users (
 user_id uuid primary key references auth.users(id), active boolean not null default true,
 created_at timestamptz not null default now()
);
create table db_style.db_style_demo_batches (
 id uuid primary key default gen_random_uuid(), created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(), removed_at timestamptz
);
create table db_style.db_style_businesses (
 id uuid primary key default gen_random_uuid(), name text not null check(length(name) between 2 and 100),
 description text not null default '', address text not null default '', city text not null default '', phone text,
 latitude numeric(10,7) check(latitude between -90 and 90), longitude numeric(10,7) check(longitude between -180 and 180),
 logo_url text, cover_url text, gallery jsonb not null default '[]', published boolean not null default true,
 active boolean not null default true, slot_step_minutes int not null default 15 check(slot_step_minutes in (5,10,15,30)),
 cancellation_minutes int not null default 60 check(cancellation_minutes>=0),
 price_edit_limit_bps int not null default 2000 check(price_edit_limit_bps between 0 and 10000), price_reason_required boolean not null default true,
 demo_batch_id uuid references db_style.db_style_demo_batches(id), created_at timestamptz not null default now()
);
create table db_style.db_style_branches (
 id uuid primary key default gen_random_uuid(), business_id uuid not null references db_style.db_style_businesses(id),
 name text not null default 'Merkez', address text not null default '', latitude numeric(10,7), longitude numeric(10,7),
 timezone text not null default 'Europe/Istanbul', active boolean not null default true, unique(id,business_id)
);
create table db_style.db_style_staff (
 id uuid primary key default gen_random_uuid(), business_id uuid not null references db_style.db_style_businesses(id),
 branch_id uuid not null, name text not null check(length(name) between 1 and 100), photo_url text,
 specialties text not null default 'Saç & sakal', active boolean not null default true, target_monthly int not null default 150 check(target_monthly>=0),
 foreign key(branch_id,business_id) references db_style.db_style_branches(id,business_id), unique(id,business_id)
);
create table db_style.db_style_business_members (
 business_id uuid not null references db_style.db_style_businesses(id), user_id uuid not null references auth.users(id),
 role text not null check(role in ('owner','manager','staff')), staff_id uuid,
 can_edit_prices boolean not null default false, can_view_finance boolean not null default false, can_manage_services boolean not null default false,
 active boolean not null default true, primary key(business_id,user_id),
 foreign key(staff_id,business_id) references db_style.db_style_staff(id,business_id),
 check(role<>'staff' or staff_id is not null)
);
create table db_style.db_style_services (
 id uuid primary key default gen_random_uuid(), business_id uuid not null references db_style.db_style_businesses(id),
 name text not null check(length(name) between 1 and 100), duration_minutes int not null check(duration_minutes between 5 and 480),
 price_cents bigint not null check(price_cents between 0 and 100000000), active boolean not null default true, icon text not null default 'cut', unique(id,business_id)
);
create table db_style.db_style_staff_services (
 business_id uuid not null, staff_id uuid not null, service_id uuid not null, primary key(staff_id,service_id),
 foreign key(staff_id,business_id) references db_style.db_style_staff(id,business_id),
 foreign key(service_id,business_id) references db_style.db_style_services(id,business_id)
);
create table db_style.db_style_working_hours (
 id uuid primary key default gen_random_uuid(), business_id uuid not null, branch_id uuid not null, staff_id uuid,
 weekday int not null check(weekday between 1 and 7), open_minute int not null check(open_minute between 0 and 1439),
 close_minute int not null check(close_minute between 1 and 1440), break_start int, break_end int, closed boolean not null default false,
 foreign key(branch_id,business_id) references db_style.db_style_branches(id,business_id),
 foreign key(staff_id,business_id) references db_style.db_style_staff(id,business_id),
 unique nulls not distinct (branch_id,staff_id,weekday), check(close_minute>open_minute),
 check((break_start is null and break_end is null) or (break_start>=open_minute and break_end<=close_minute and break_end>break_start))
);
create table db_style.db_style_staff_status (
 staff_id uuid primary key, business_id uuid not null,
 status text not null default 'available' check(status in ('available','waiting','started','in_progress','completed','break','busy','off')),
 expected_return_at timestamptz, updated_at timestamptz not null default now(),
 foreign key(staff_id,business_id) references db_style.db_style_staff(id,business_id)
);
create table db_style.db_style_calendar_entries (
 id uuid primary key default gen_random_uuid(), business_id uuid not null, staff_id uuid not null,
 starts_at timestamptz not null, ends_at timestamptz not null, kind text not null check(kind in ('appointment','session','block','hold')),
 reference_id uuid, active boolean not null default true, expires_at timestamptz,
 foreign key(staff_id,business_id) references db_style.db_style_staff(id,business_id), check(ends_at>starts_at),
 exclude using gist (staff_id with =, tstzrange(starts_at,ends_at,'[)') with &&) where(active)
);
create index db_style_calendar_reference on db_style.db_style_calendar_entries(reference_id);
create table db_style.db_style_customers (
 id uuid primary key default gen_random_uuid(), business_id uuid not null references db_style.db_style_businesses(id),
 user_id uuid references auth.users(id), name text not null default 'Misafir Müşteri', phone text,
 preferences_consent boolean not null default false, favorite_staff_id uuid, created_at timestamptz not null default now(),
 unique(business_id,user_id), unique(id,business_id), foreign key(favorite_staff_id,business_id) references db_style.db_style_staff(id,business_id)
);
create table db_style.db_style_customer_notes (
 id uuid primary key default gen_random_uuid(), business_id uuid not null, customer_id uuid not null, staff_id uuid not null,
 note text not null check(length(note) between 1 and 1500), created_by uuid not null references auth.users(id), created_at timestamptz not null default now(),
 foreign key(customer_id,business_id) references db_style.db_style_customers(id,business_id), foreign key(staff_id,business_id) references db_style.db_style_staff(id,business_id)
);
create table db_style.db_style_platform_fee_rules (
 id uuid primary key default gen_random_uuid(), business_id uuid references db_style.db_style_businesses(id), staff_id uuid, service_id uuid,
 fee_cents bigint not null default 2000 check(fee_cents between 0 and 10000000), fee_bps int not null default 0 check(fee_bps between 0 and 10000),
 valid_from timestamptz not null default now(), created_by uuid references auth.users(id), created_at timestamptz not null default now(),
 check((staff_id is null and service_id is null) or business_id is not null),
 foreign key(staff_id,business_id) references db_style.db_style_staff(id,business_id), foreign key(service_id,business_id) references db_style.db_style_services(id,business_id)
);
insert into db_style.db_style_platform_fee_rules(fee_cents) values(2000);
create table db_style.db_style_promo_codes (
 id uuid primary key default gen_random_uuid(), business_id uuid not null, staff_id uuid not null, code text not null unique,
 discount_bps int not null check(discount_bps between 0 and 10000), applies_to text not null default 'service' check(applies_to in ('service','total')),
 expires_at timestamptz, max_uses int check(max_uses>0), uses int not null default 0, active boolean not null default true,
 foreign key(staff_id,business_id) references db_style.db_style_staff(id,business_id)
);
create table db_style.db_style_customer_discounts (
 id uuid primary key default gen_random_uuid(), business_id uuid not null, customer_id uuid not null, staff_id uuid not null,
 discount_bps int not null default 0 check(discount_bps between 0 and 10000), fixed_price_cents bigint check(fixed_price_cents>=0),
 promo_code_id uuid references db_style.db_style_promo_codes(id), unique(customer_id,staff_id),
 foreign key(customer_id,business_id) references db_style.db_style_customers(id,business_id), foreign key(staff_id,business_id) references db_style.db_style_staff(id,business_id)
);
create table db_style.db_style_appointments (
 id uuid primary key default gen_random_uuid(), business_id uuid not null, branch_id uuid not null, staff_id uuid not null,
 service_id uuid not null, customer_id uuid not null, customer_user_id uuid references auth.users(id),
 starts_at timestamptz not null, ends_at timestamptz not null, status text not null default 'booked' check(status in ('booked','arrived','in_progress','completed','cancelled','no_show')),
 quoted_base_cents bigint not null check(quoted_base_cents>=0), quoted_discount_cents bigint not null default 0 check(quoted_discount_cents>=0),
 quoted_service_cents bigint not null check(quoted_service_cents>=0), quoted_fee_cents bigint not null check(quoted_fee_cents>=0),
 promo_code_id uuid references db_style.db_style_promo_codes(id), source text not null default 'app' check(source in ('app','walkin','owner','demo')),
 note text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,business_id),
 foreign key(branch_id,business_id) references db_style.db_style_branches(id,business_id), foreign key(staff_id,business_id) references db_style.db_style_staff(id,business_id),
 foreign key(service_id,business_id) references db_style.db_style_services(id,business_id), foreign key(customer_id,business_id) references db_style.db_style_customers(id,business_id), check(ends_at>starts_at)
);
create index db_style_appointments_user_date on db_style.db_style_appointments(customer_user_id,starts_at);
create index db_style_appointments_business_date on db_style.db_style_appointments(business_id,starts_at);
create index db_style_appointments_staff_date on db_style.db_style_appointments(staff_id,starts_at);
create table db_style.db_style_service_sessions (
 id uuid primary key default gen_random_uuid(), business_id uuid not null, branch_id uuid not null, staff_id uuid not null, service_id uuid not null, customer_id uuid not null,
 appointment_id uuid unique, source text not null check(source in ('app','walkin','owner','demo')), started_at timestamptz not null default now(), expected_end_at timestamptz not null,
 completed_at timestamptz, state text not null default 'active' check(state in ('active','completed','reversed')),
 normal_price_cents bigint not null check(normal_price_cents>=0), discount_cents bigint not null default 0 check(discount_cents>=0),
 service_cents bigint check(service_cents>=0), fee_cents bigint check(fee_cents>=0), total_cents bigint check(total_cents>=0),
 quoted_service_cents bigint not null, quoted_fee_cents bigint not null, price_reason text,
 service_payment_status text not null default 'unpaid' check(service_payment_status in ('unpaid','paid')),
 service_payment_method text check(service_payment_method in ('cash','card','transfer')), unique(id,business_id),
 foreign key(branch_id,business_id) references db_style.db_style_branches(id,business_id), foreign key(staff_id,business_id) references db_style.db_style_staff(id,business_id),
 foreign key(service_id,business_id) references db_style.db_style_services(id,business_id), foreign key(customer_id,business_id) references db_style.db_style_customers(id,business_id),
 foreign key(appointment_id,business_id) references db_style.db_style_appointments(id,business_id), check(total_cents is null or total_cents=service_cents+fee_cents)
);
create unique index db_style_one_active_session on db_style.db_style_service_sessions(staff_id) where(state='active');
create index db_style_sessions_business_date on db_style.db_style_service_sessions(business_id,completed_at);
create index db_style_sessions_staff_date on db_style.db_style_service_sessions(staff_id,completed_at);
create table db_style.db_style_waitlists (
 id uuid primary key default gen_random_uuid(), business_id uuid not null, staff_id uuid not null, service_id uuid not null, user_id uuid not null references auth.users(id),
 range_start timestamptz not null, range_end timestamptz not null, state text not null default 'waiting' check(state in ('waiting','notified','booked','cancelled')),
 notified_at timestamptz, created_at timestamptz not null default now(), check(range_end>range_start),
 foreign key(staff_id,business_id) references db_style.db_style_staff(id,business_id), foreign key(service_id,business_id) references db_style.db_style_services(id,business_id)
);
create table db_style.db_style_extra_slot_requests (
 id uuid primary key default gen_random_uuid(), business_id uuid not null, staff_id uuid not null, service_id uuid not null, user_id uuid not null references auth.users(id),
 requested_at timestamptz not null, message text not null default '', state text not null default 'pending' check(state in ('pending','offered','accepted','rejected','expired')),
 offered_at timestamptz, hold_expires_at timestamptz, appointment_id uuid references db_style.db_style_appointments(id), created_at timestamptz not null default now(),
 foreign key(staff_id,business_id) references db_style.db_style_staff(id,business_id), foreign key(service_id,business_id) references db_style.db_style_services(id,business_id)
);
create table db_style.db_style_walkin_queue (
 id uuid primary key default gen_random_uuid(), business_id uuid not null, staff_id uuid not null, service_id uuid not null, customer_id uuid not null,
 state text not null default 'waiting' check(state in ('waiting','called','served','cancelled')), joined_at timestamptz not null default now(),
 foreign key(staff_id,business_id) references db_style.db_style_staff(id,business_id), foreign key(service_id,business_id) references db_style.db_style_services(id,business_id), foreign key(customer_id,business_id) references db_style.db_style_customers(id,business_id)
);
create table db_style.db_style_chat_conversations (
 id uuid primary key default gen_random_uuid(), business_id uuid not null, staff_id uuid not null, customer_user_id uuid not null references auth.users(id),
 appointment_id uuid references db_style.db_style_appointments(id), created_at timestamptz not null default now(),
 unique(staff_id,customer_user_id), foreign key(staff_id,business_id) references db_style.db_style_staff(id,business_id)
);
create table db_style.db_style_chat_messages (
 id uuid primary key default gen_random_uuid(), business_id uuid not null references db_style.db_style_businesses(id), conversation_id uuid not null references db_style.db_style_chat_conversations(id),
 sender_id uuid not null references auth.users(id), body text not null check(length(body) between 1 and 2000), created_at timestamptz not null default now(), read_at timestamptz
);
create index db_style_message_order on db_style.db_style_chat_messages(conversation_id,created_at);
create table db_style.db_style_chat_blocks (
 user_id uuid not null references auth.users(id), conversation_id uuid not null references db_style.db_style_chat_conversations(id), created_at timestamptz not null default now(), primary key(user_id,conversation_id)
);
create table db_style.db_style_message_reports (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id), message_id uuid not null references db_style.db_style_chat_messages(id), reason text not null, created_at timestamptz not null default now()
);
create table db_style.db_style_notifications (
 id uuid primary key default gen_random_uuid(), business_id uuid references db_style.db_style_businesses(id), user_id uuid not null references auth.users(id),
 title text not null, body text not null, kind text not null, reference_id uuid, dedupe_key text unique, created_at timestamptz not null default now(), read_at timestamptz,
 push_status text not null default 'pending' check(push_status in ('pending','processing','sent','failed')), push_attempts int not null default 0
);
create index db_style_notifications_user on db_style.db_style_notifications(user_id,created_at desc);
create table db_style.db_style_push_tokens (
 user_id uuid not null references auth.users(id), token text not null, active boolean not null default true, updated_at timestamptz not null default now(), primary key(user_id,token)
);
create table db_style.db_style_appointment_locations (
 appointment_id uuid primary key references db_style.db_style_appointments(id), business_id uuid not null references db_style.db_style_businesses(id), user_id uuid not null references auth.users(id),
 consent_at timestamptz not null, latitude numeric(10,7) check(latitude between -90 and 90), longitude numeric(10,7) check(longitude between -180 and 180),
 accuracy_meters numeric, eta_minutes int check(eta_minutes between 0 and 1440), arrival_state text not null default 'on_way' check(arrival_state in ('on_way','nearby','arrived','late')),
 updated_at timestamptz not null default now(), expires_at timestamptz not null, shared boolean not null default true
);
create table db_style.db_style_payment_plans (
 business_id uuid primary key references db_style.db_style_businesses(id), cadence text not null default 'monthly' check(cadence in ('weekly','monthly')),
 day_number int not null default 1 check(day_number between 1 and 28), approved boolean not null default false, approved_by uuid references auth.users(id),
 requested_at timestamptz not null default now(), effective_from date not null default current_date, check(cadence<>'weekly' or day_number<=7)
);
create table db_style.db_style_payment_periods (
 id uuid primary key default gen_random_uuid(), business_id uuid not null references db_style.db_style_businesses(id),
 starts_at timestamptz not null, ends_at timestamptz not null, due_at timestamptz not null, closed boolean not null default false,
 unique(business_id,starts_at,ends_at), check(ends_at>starts_at), unique(id,business_id),
 exclude using gist(business_id with =, tstzrange(starts_at,ends_at,'[)') with &&)
);
create table db_style.db_style_platform_fee_ledger (
 id uuid primary key default gen_random_uuid(), business_id uuid not null, session_id uuid not null, period_id uuid not null,
 amount_cents bigint not null, kind text not null check(kind in ('charge','reversal')), reversal_of uuid unique references db_style.db_style_platform_fee_ledger(id),
 created_at timestamptz not null default now(), unique(session_id,kind),
 foreign key(session_id,business_id) references db_style.db_style_service_sessions(id,business_id), foreign key(period_id,business_id) references db_style.db_style_payment_periods(id,business_id),
 check((kind='charge' and amount_cents>=0 and reversal_of is null) or (kind='reversal' and amount_cents<=0 and reversal_of is not null))
);
create index db_style_ledger_business_date on db_style.db_style_platform_fee_ledger(business_id,created_at);
create table db_style.db_style_payment_claims (
 id uuid primary key default gen_random_uuid(), business_id uuid not null, period_id uuid not null, amount_cents bigint not null check(amount_cents>0),
 method text not null check(method in ('transfer','cash')), paid_at timestamptz not null, receipt_path text, explanation text not null default '',
 state text not null default 'pending' check(state in ('pending','approved','rejected')), submitted_by uuid not null references auth.users(id),
 reviewed_by uuid references auth.users(id), reviewed_at timestamptz, review_reason text, created_at timestamptz not null default now(), unique(id,business_id),
 foreign key(period_id,business_id) references db_style.db_style_payment_periods(id,business_id)
);
create table db_style.db_style_payment_receipts (
 id uuid primary key default gen_random_uuid(), business_id uuid not null, claim_id uuid not null unique, amount_cents bigint not null check(amount_cents>0),
 confirmed_by uuid not null references auth.users(id), confirmed_at timestamptz not null default now(), foreign key(claim_id,business_id) references db_style.db_style_payment_claims(id,business_id), unique(id,business_id)
);
create table db_style.db_style_payment_allocations (
 id uuid primary key default gen_random_uuid(), business_id uuid not null, receipt_id uuid not null unique, period_id uuid not null, amount_cents bigint not null check(amount_cents>0),
 foreign key(receipt_id,business_id) references db_style.db_style_payment_receipts(id,business_id), foreign key(period_id,business_id) references db_style.db_style_payment_periods(id,business_id)
);
create table db_style.db_style_service_payment_events (
 id uuid primary key default gen_random_uuid(), business_id uuid not null, session_id uuid not null unique,
 amount_cents bigint not null check(amount_cents>=0), method text not null check(method in ('cash','card','transfer')), created_at timestamptz not null default now(),
 foreign key(session_id,business_id) references db_style.db_style_service_sessions(id,business_id)
);
create table db_style.db_style_session_reversals (
 id uuid primary key default gen_random_uuid(), business_id uuid not null, session_id uuid not null unique, service_cents bigint not null, fee_cents bigint not null,
 reason text not null check(length(reason)>2), created_by uuid not null references auth.users(id), created_at timestamptz not null default now(), foreign key(session_id,business_id) references db_style.db_style_service_sessions(id,business_id)
);
create table db_style.db_style_reviews (
 id uuid primary key default gen_random_uuid(), business_id uuid not null, staff_id uuid not null, session_id uuid not null unique, user_id uuid not null references auth.users(id),
 rating int not null check(rating between 1 and 5), comment text not null default '' check(length(comment)<=1000), created_at timestamptz not null default now(),
 foreign key(staff_id,business_id) references db_style.db_style_staff(id,business_id), foreign key(session_id,business_id) references db_style.db_style_service_sessions(id,business_id)
);
create table db_style.db_style_favorites (
 user_id uuid not null references auth.users(id), business_id uuid not null references db_style.db_style_businesses(id), created_at timestamptz not null default now(), primary key(user_id,business_id)
);
create table db_style.db_style_loyalty_programs (
 business_id uuid primary key references db_style.db_style_businesses(id), visits_required int not null default 10 check(visits_required>=2), reward_bps int not null default 1000 check(reward_bps between 0 and 10000), active boolean not null default false
);
create table db_style.db_style_campaigns (
 id uuid primary key default gen_random_uuid(), business_id uuid not null references db_style.db_style_businesses(id), title text not null, message text not null, created_at timestamptz not null default now(), created_by uuid not null references auth.users(id)
);
create table db_style.db_style_audit_logs (
 id bigint generated always as identity primary key, actor_id uuid, business_id uuid, action text not null,
 entity_id uuid, details jsonb not null default '{}', created_at timestamptz not null default now()
);
create index db_style_audit_business on db_style.db_style_audit_logs(business_id,created_at desc);
create table db_style.db_style_idempotency_keys (
 user_id uuid not null references auth.users(id), key uuid not null, action text not null, payload_hash text not null, result jsonb not null, created_at timestamptz not null default now(), primary key(user_id,key)
);
create table db_style.db_style_app_settings (
 key text primary key, value jsonb not null, updated_at timestamptz not null default now()
);
insert into db_style.db_style_app_settings values ('payment_instructions','{"iban":"","recipient":"","note":"Hesap bilgileri Admin tarafından tanımlanır."}',now());

-- Read helpers use a fixed search_path. Authorization never uses user_metadata or email.
create function db_style.db_style_is_admin() returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from db_style.db_style_admin_users where user_id=auth.uid() and active)
$$;
create function db_style.db_style_can_manage(dkd_business uuid) returns boolean language sql stable security definer set search_path='' as $$
 select db_style.db_style_is_admin() or exists(select 1 from db_style.db_style_business_members where business_id=dkd_business and user_id=auth.uid() and active and role in ('owner','manager'))
$$;
create function db_style.db_style_can_staff(dkd_business uuid, dkd_staff uuid) returns boolean language sql stable security definer set search_path='' as $$
 select db_style.db_style_can_manage(dkd_business) or exists(select 1 from db_style.db_style_business_members where business_id=dkd_business and staff_id=dkd_staff and user_id=auth.uid() and active)
$$;
create function db_style.db_style_can_finance(dkd_business uuid) returns boolean language sql stable security definer set search_path='' as $$
 select db_style.db_style_can_manage(dkd_business) or exists(select 1 from db_style.db_style_business_members where business_id=dkd_business and user_id=auth.uid() and active and can_view_finance)
$$;
create function db_style.db_style_customer_access(dkd_business uuid,dkd_customer uuid) returns boolean language sql stable security definer set search_path='' as $$
 select db_style.db_style_can_manage(dkd_business) or exists(select 1 from db_style.db_style_customers where id=dkd_customer and user_id=auth.uid()) or exists(
 select 1 from db_style.db_style_service_sessions s where s.customer_id=dkd_customer and db_style.db_style_can_staff(dkd_business,s.staff_id)) or exists(
 select 1 from db_style.db_style_appointments a where a.customer_id=dkd_customer and db_style.db_style_can_staff(dkd_business,a.staff_id))
$$;
create function db_style.db_style_conversation_access(dkd_conversation uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from db_style.db_style_chat_conversations where id=dkd_conversation and (customer_user_id=auth.uid() or db_style.db_style_can_staff(business_id,staff_id)))
$$;
create function db_style.db_style_public_business(dkd_business uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from db_style.db_style_businesses where id=dkd_business and active and published)
$$;

-- SELECT-only access. Every mutation goes through the transactional command endpoint.
do $$ declare dkd_table record; begin
 for dkd_table in select tablename from pg_tables where schemaname='db_style' loop
  execute format('alter table db_style.%I enable row level security',dkd_table.tablename);
  execute format('grant select on db_style.%I to authenticated',dkd_table.tablename);
 end loop;
end $$;
create policy db_style_profile_read on db_style.db_style_profiles for select to authenticated using(user_id=(select auth.uid()) or (select db_style.db_style_is_admin()));
create policy db_style_admin_read on db_style.db_style_admin_users for select to authenticated using(user_id=(select auth.uid()));
create policy db_style_demo_read on db_style.db_style_demo_batches for select to authenticated using((select db_style.db_style_is_admin()));
create policy db_style_business_public on db_style.db_style_businesses for select to anon,authenticated using((active and published) or db_style.db_style_can_manage(id));
create policy db_style_members_read on db_style.db_style_business_members for select to authenticated using(user_id=(select auth.uid()) or db_style.db_style_can_manage(business_id));
do $$ declare dkd_table text; begin
 foreach dkd_table in array array['db_style_branches','db_style_staff','db_style_services','db_style_staff_services','db_style_working_hours','db_style_staff_status','db_style_reviews'] loop
  execute format('create policy db_style_public_read on db_style.%I for select to anon,authenticated using (db_style.db_style_public_business(business_id) or db_style.db_style_can_manage(business_id))',dkd_table);
  execute format('grant select on db_style.%I to anon',dkd_table);
 end loop;
end $$;
grant select on db_style.db_style_businesses to anon;
create policy db_style_calendar_staff on db_style.db_style_calendar_entries for select to authenticated using(db_style.db_style_can_staff(business_id,staff_id));
create policy db_style_customer_read on db_style.db_style_customers for select to authenticated using(db_style.db_style_customer_access(business_id,id));
create policy db_style_notes_read on db_style.db_style_customer_notes for select to authenticated using(db_style.db_style_can_staff(business_id,staff_id) or exists(select 1 from db_style.db_style_customers c where c.id=customer_id and c.user_id=(select auth.uid())));
create policy db_style_appointment_read on db_style.db_style_appointments for select to authenticated using(customer_user_id=(select auth.uid()) or db_style.db_style_can_staff(business_id,staff_id));
create policy db_style_session_read on db_style.db_style_service_sessions for select to authenticated using(db_style.db_style_can_staff(business_id,staff_id) or exists(select 1 from db_style.db_style_customers c where c.id=customer_id and c.user_id=(select auth.uid())));
create policy db_style_waitlist_read on db_style.db_style_waitlists for select to authenticated using(user_id=(select auth.uid()) or db_style.db_style_can_staff(business_id,staff_id));
create policy db_style_extra_read on db_style.db_style_extra_slot_requests for select to authenticated using(user_id=(select auth.uid()) or db_style.db_style_can_staff(business_id,staff_id));
create policy db_style_queue_read on db_style.db_style_walkin_queue for select to authenticated using(db_style.db_style_can_staff(business_id,staff_id));
create policy db_style_chat_read on db_style.db_style_chat_conversations for select to authenticated using(customer_user_id=(select auth.uid()) or db_style.db_style_can_staff(business_id,staff_id));
create policy db_style_message_read on db_style.db_style_chat_messages for select to authenticated using(db_style.db_style_conversation_access(conversation_id));
create policy db_style_block_read on db_style.db_style_chat_blocks for select to authenticated using(user_id=(select auth.uid()));
create policy db_style_report_read on db_style.db_style_message_reports for select to authenticated using(user_id=(select auth.uid()) or (select db_style.db_style_is_admin()));
create policy db_style_notification_read on db_style.db_style_notifications for select to authenticated using(user_id=(select auth.uid()));
create policy db_style_token_read on db_style.db_style_push_tokens for select to authenticated using(user_id=(select auth.uid()));
create policy db_style_location_read on db_style.db_style_appointment_locations for select to authenticated using(user_id=(select auth.uid()) or (shared and expires_at>now() and exists(select 1 from db_style.db_style_appointments a where a.id=appointment_id and a.status in ('booked','arrived') and db_style.db_style_can_staff(a.business_id,a.staff_id))));
do $$ declare dkd_table text; begin
 foreach dkd_table in array array['db_style_platform_fee_ledger','db_style_payment_periods','db_style_payment_claims','db_style_payment_receipts','db_style_payment_allocations','db_style_payment_plans','db_style_service_payment_events','db_style_session_reversals'] loop
  execute format('create policy db_style_finance_read on db_style.%I for select to authenticated using(db_style.db_style_can_finance(business_id))',dkd_table);
 end loop;
end $$;
create policy db_style_fee_read on db_style.db_style_platform_fee_rules for select to authenticated using((select db_style.db_style_is_admin()) or (business_id is not null and db_style.db_style_can_finance(business_id)));
create policy db_style_promo_read on db_style.db_style_promo_codes for select to authenticated using(db_style.db_style_can_staff(business_id,staff_id));
create policy db_style_discount_read on db_style.db_style_customer_discounts for select to authenticated using(db_style.db_style_customer_access(business_id,customer_id));
create policy db_style_favorite_read on db_style.db_style_favorites for select to authenticated using(user_id=(select auth.uid()));
create policy db_style_loyalty_read on db_style.db_style_loyalty_programs for select to authenticated using(db_style.db_style_can_manage(business_id));
create policy db_style_campaign_read on db_style.db_style_campaigns for select to authenticated using(db_style.db_style_can_manage(business_id));
create policy db_style_audit_read on db_style.db_style_audit_logs for select to authenticated using((select db_style.db_style_is_admin()) or db_style.db_style_can_manage(business_id));
create policy db_style_idempotency_read on db_style.db_style_idempotency_keys for select to authenticated using(user_id=(select auth.uid()));
create policy db_style_settings_read on db_style.db_style_app_settings for select to authenticated using(true);

create function db_style.db_style_immutable() returns trigger language plpgsql set search_path='' as $$ begin
 raise exception 'Değiştirilemez kayıt: düzeltme için ters kayıt kullanın.' using errcode='42501';
end $$;
do $$ declare dkd_table text; begin
 foreach dkd_table in array array['db_style_platform_fee_ledger','db_style_payment_receipts','db_style_payment_allocations','db_style_audit_logs','db_style_service_payment_events','db_style_session_reversals'] loop
  execute format('create trigger db_style_immutable before update or delete on db_style.%I for each row execute function db_style.db_style_immutable()',dkd_table);
 end loop;
end $$;

create view db_style.db_style_business_balances with(security_invoker=true) as
 select b.id as business_id,
 coalesce((select sum(l.amount_cents) from db_style.db_style_platform_fee_ledger l where l.business_id=b.id),0)::bigint as accrued_cents,
 coalesce((select sum(r.amount_cents) from db_style.db_style_payment_receipts r where r.business_id=b.id),0)::bigint as collected_cents,
 (coalesce((select sum(l.amount_cents) from db_style.db_style_platform_fee_ledger l where l.business_id=b.id),0)-coalesce((select sum(r.amount_cents) from db_style.db_style_payment_receipts r where r.business_id=b.id),0))::bigint as balance_cents
 from db_style.db_style_businesses b;
grant select on db_style.db_style_business_balances to authenticated;
revoke all on all functions in schema db_style from public;
grant execute on function db_style.db_style_is_admin(),db_style.db_style_can_manage(uuid),db_style.db_style_can_staff(uuid,uuid),db_style.db_style_can_finance(uuid),db_style.db_style_customer_access(uuid,uuid),db_style.db_style_conversation_access(uuid),db_style.db_style_public_business(uuid) to authenticated;
grant execute on function db_style.db_style_public_business(uuid),db_style.db_style_can_manage(uuid),db_style.db_style_is_admin() to anon;
