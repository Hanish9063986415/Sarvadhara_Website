-- PostgREST (Supabase API) uses the service_role JWT. RLS bypass does not replace
-- table-level GRANTs — without these, inserts return "permission denied for table …".

grant usage on schema public to postgres, service_role;

grant usage on type public.crm_project_status to service_role;
grant usage on type public.crm_delivery_phase to service_role;
grant usage on type public.crm_finance_kind to service_role;

grant all on table public.crm_projects to service_role;
grant all on table public.crm_project_tasks to service_role;
grant all on table public.crm_project_payment_transactions to service_role;
grant all on table public.crm_project_documents to service_role;
grant all on table public.crm_maintenance_payment_records to service_role;
grant all on table public.crm_maintenance_settings to service_role;
grant all on table public.crm_finance_entries to service_role;
grant all on table public.crm_monthly_expenses to service_role;
grant all on table public.crm_maintenance_invoice_shares to service_role;

grant execute on function public.set_updated_at() to service_role;

alter default privileges in schema public
  grant all on tables to service_role;
