-- Cover only this app's foreign keys. Other applications' indexes are untouched.
do $$ declare dkd_fk record; dkd_columns text; begin
 for dkd_fk in
  select c.conrelid,c.conname,c.conkey,t.relname from pg_constraint c
  join pg_class t on t.oid=c.conrelid join pg_namespace n on n.oid=t.relnamespace
  where c.contype='f' and n.nspname='db_style' and not exists (
   select 1 from pg_index i where i.indrelid=c.conrelid and i.indisvalid and i.indpred is null
   and c.conkey <@ (select array_agg(k order by ord) from unnest(i.indkey) with ordinality u(k,ord) where ord<=cardinality(c.conkey))
  )
 loop
  select string_agg(quote_ident(a.attname),',' order by u.ord) into dkd_columns
  from unnest(dkd_fk.conkey) with ordinality u(k,ord) join pg_attribute a on a.attrelid=dkd_fk.conrelid and a.attnum=u.k;
  execute format('create index %I on db_style.%I (%s)','db_style_fk_'||substr(md5(dkd_fk.relname||dkd_fk.conname),1,14),dkd_fk.relname,dkd_columns);
 end loop;
end $$;

-- One SELECT policy per table avoids duplicate permission checks.
drop policy db_style_fee_own_staff on db_style.db_style_platform_fee_ledger;
drop policy db_style_reversal_own_staff on db_style.db_style_session_reversals;
drop policy db_style_service_payment_own_staff on db_style.db_style_service_payment_events;
do $$ declare dkd_table text; begin
 foreach dkd_table in array array['db_style_platform_fee_ledger','db_style_session_reversals','db_style_service_payment_events'] loop
  execute format('alter policy db_style_finance_read on db_style.%I using(db_style.db_style_can_finance(business_id) or exists(select 1 from db_style.db_style_service_sessions s where s.id=session_id and db_style.db_style_can_staff(s.business_id,s.staff_id)))',dkd_table);
 end loop;
end $$;
