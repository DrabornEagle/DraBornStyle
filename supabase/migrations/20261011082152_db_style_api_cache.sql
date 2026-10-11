-- Remove only the missing legacy Style schema from the existing Data API setting.
-- db_style stays private: public SECURITY INVOKER RPCs expose its authorized API.
do $$ declare dkd_schemas text; dkd_new text; begin
 select split_part(x,'=',2) into dkd_schemas from pg_roles r,unnest(r.rolconfig)x where r.rolname='authenticator' and x like 'pgrst.db_schemas=%';
 if dkd_schemas is not null and not exists(select 1 from pg_namespace where nspname='drabornstyle') then
  select string_agg(trim(s),', ' order by n) into dkd_new from unnest(string_to_array(dkd_schemas,',')) with ordinality as x(s,n) where trim(s)<>'drabornstyle';
  execute format('alter role authenticator set pgrst.db_schemas=%L',dkd_new);
 end if;
end $$;
notify pgrst,'reload config';
notify pgrst,'reload schema';
