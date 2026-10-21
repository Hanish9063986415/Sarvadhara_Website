-- Optional: run AFTER 20260320120000_initial_crm_schema.sql to confirm everything exists.
-- Expected: one row per table in crm_* ; maintenance settings row id = 'default'.

select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name like 'crm_%'
order by table_name;

select id, clearance_day, updated_at
from public.crm_maintenance_settings
where id = 'default';
