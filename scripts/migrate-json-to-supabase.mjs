/**
 * One-shot migration: local JSON CRM files → Supabase Postgres.
 *
 * Prerequisites:
 *   1. Run supabase/migrations/20260320120000_initial_crm_schema.sql on your project.
 *   2. Set in .env.local (or env):
 *        NEXT_PUBLIC_SUPABASE_URL=
 *        SUPABASE_SERVICE_ROLE_KEY=
 *
 * Usage:
 *   node scripts/migrate-json-to-supabase.mjs
 *   node scripts/migrate-json-to-supabase.mjs --dry-run
 *   node scripts/migrate-json-to-supabase.mjs --wipe   # delete CRM rows before import
 */

import { createClient } from '@supabase/supabase-js'
import { promises as fs, readFileSync } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const dataDir = path.join(root, 'data')

const dryRun = process.argv.includes('--dry-run')
const wipe = process.argv.includes('--wipe')

function loadEnvLocal() {
  const envPath = path.join(root, '.env.local')
  try {
    const raw = readFileSync(envPath, 'utf8')
    for (const line of raw.split('\n')) {
      const t = line.trim()
      if (!t || t.startsWith('#')) continue
      const i = t.indexOf('=')
      if (i === -1) continue
      const key = t.slice(0, i).trim()
      let val = t.slice(i + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      if (!process.env[key]) process.env[key] = val
    }
  } catch {
    /* optional */
  }
}

loadEnvLocal()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
if (!url || !key) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

/** Warn if anon/publishable key was pasted into SUPABASE_SERVICE_ROLE_KEY. */
function assertServiceRoleKey(apiKey) {
  const parts = apiKey.split('.')
  if (parts.length !== 3) return
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'))
    const role = payload.role
    if (role === 'anon') {
      console.error(
        'SUPABASE_SERVICE_ROLE_KEY is the anon (public) key. In Supabase Dashboard → Project Settings → API, copy the service_role secret (not the anon key).'
      )
      process.exit(1)
    }
    if (role && role !== 'service_role') {
      console.warn(`Warning: JWT role is "${role}", expected service_role.`)
    }
  } catch {
    /* not a JWT — ignore */
  }
}

assertServiceRoleKey(key)

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const PERMISSION_DENIED_HINT =
  'Run supabase/migrations/20260320120200_crm_table_grants.sql in the Supabase SQL Editor (grants service_role access to CRM tables).'

function throwIfDbError(context, error) {
  if (!error) return
  const msg = `${context}: ${error.message}`
  if (/permission denied for table/i.test(error.message)) {
    throw new Error(`${msg}\n\n${PERMISSION_DENIED_HINT}`)
  }
  throw new Error(msg)
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const projectIdMap = new Map()

function asUuid(id, label) {
  if (typeof id === 'string' && UUID_RE.test(id)) return id
  const next = randomUUID()
  console.warn(`  [id] Invalid UUID for ${label}, assigned ${next}`)
  return next
}

function mapProjectId(id) {
  const key = String(id ?? '')
  if (!key) return null
  if (projectIdMap.has(key)) return projectIdMap.get(key)
  const mapped = asUuid(key, `project ${key}`)
  projectIdMap.set(key, mapped)
  return mapped
}

function parseDate(iso) {
  if (typeof iso !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return null
  return iso.slice(0, 10)
}

async function readJson(name, fallback) {
  try {
    const raw = await fs.readFile(path.join(dataDir, name), 'utf8')
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

async function wipeTables() {
  const order = [
    'crm_maintenance_invoice_shares',
    'crm_maintenance_payment_records',
    'crm_project_documents',
    'crm_project_payment_transactions',
    'crm_project_tasks',
    'crm_finance_entries',
    'crm_monthly_expenses',
    'crm_projects',
  ]
  for (const table of order) {
    if (dryRun) {
      console.log(`[dry-run] would delete from ${table}`)
      continue
    }
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (error && !error.message.includes('crm_maintenance_settings')) {
      console.warn(`  wipe ${table}:`, error.message)
    }
  }
  if (!dryRun) console.log('Wiped CRM tables (except maintenance settings row).')
}

async function migrateProjects() {
  const projects = await readJson('crm-projects.json', [])
  if (!Array.isArray(projects) || projects.length === 0) {
    console.log('No crm-projects.json rows.')
    return
  }

  for (const p of projects) {
    const id = mapProjectId(p.id)
    const row = {
      id,
      project_name: String(p.projectName ?? ''),
      client_name: String(p.clientName ?? ''),
      client_email: String(p.clientEmail ?? ''),
      client_phone: String(p.clientPhone ?? ''),
      client_address: String(p.clientAddress ?? ''),
      project_url: String(p.projectUrl ?? ''),
      total_contract_amount: Number(p.totalContractAmount) || 0,
      first_transaction_amount: Number(p.firstTransactionAmount) || 0,
      payments_cleared_amount: Number(p.paymentsClearedAmount) || 0,
      balance: Number(p.balance) || 0,
      all_payments_cleared: Boolean(p.allPaymentsCleared),
      status: ['active', 'completed', 'on_hold'].includes(p.status) ? p.status : 'active',
      notes: String(p.notes ?? ''),
      progress_percent: Math.min(100, Math.max(0, Math.round(Number(p.progressPercent) || 0))),
      delivery_phase: [
        'discovery',
        'design',
        'development',
        'qa',
        'launch',
        'support',
      ].includes(p.deliveryPhase)
        ? p.deliveryPhase
        : 'discovery',
      maintenance_enabled: Boolean(p.maintenanceEnabled),
      maintenance_monthly_amount: Number(p.maintenanceMonthlyAmount) || 0,
      maintenance_billing_day: Math.min(28, Math.max(1, Math.round(Number(p.maintenanceBillingDay) || 1))),
      created_at: p.createdAt || new Date().toISOString(),
      updated_at: p.updatedAt || new Date().toISOString(),
    }

    if (dryRun) {
      console.log(`[dry-run] project ${row.project_name} (${id})`)
      continue
    }

    const { error } = await supabase.from('crm_projects').upsert(row)
    throwIfDbError(`project ${id}`, error)

    const tasks = Array.isArray(p.tasks) ? p.tasks : []
    if (tasks.length) {
      const taskRows = tasks.map((t, i) => ({
        id: asUuid(t.id, 'task'),
        project_id: id,
        title: String(t.title ?? '').trim() || 'Task',
        description: String(t.description ?? ''),
        meter: Math.min(100, Math.max(0, Math.round(Number(t.meter) || 0))),
        sort_order: i,
      }))
      const { error: te } = await supabase.from('crm_project_tasks').upsert(taskRows)
      throwIfDbError(`tasks ${id}`, te)
    }

    const txns = Array.isArray(p.transactions) ? p.transactions : []
    if (txns.length) {
      const txnRows = txns.map((t, i) => ({
        id: asUuid(t.id, 'txn'),
        project_id: id,
        label: String(t.label ?? ''),
        amount: Math.max(0, Number(t.amount) || 0),
        paid_on: parseDate(t.paidOn),
        note: String(t.note ?? ''),
        sort_order: i,
      }))
      const { error: xe } = await supabase.from('crm_project_payment_transactions').upsert(txnRows)
      throwIfDbError(`transactions ${id}`, xe)
    }

    const docs = Array.isArray(p.documents) ? p.documents : []
    if (docs.length) {
      const docRows = docs.map((d) => ({
        id: asUuid(d.id, 'doc'),
        project_id: id,
        label: String(d.label ?? ''),
        file_name: String(d.fileName ?? ''),
        mime_type: String(d.mimeType ?? ''),
        size_bytes: Math.max(0, Number(d.sizeBytes) || 0),
        storage_path: `${id}/${d.fileName ?? ''}`,
        uploaded_at: d.uploadedAt || new Date().toISOString(),
      }))
      const { error: de } = await supabase.from('crm_project_documents').upsert(docRows)
      throwIfDbError(`documents ${id}`, de)
    }
  }
  console.log(`Migrated ${projects.length} project(s).`)
}

async function migrateMaintenanceRecords() {
  const records = await readJson('crm-maintenance-records.json', [])
  if (!Array.isArray(records) || records.length === 0) {
    console.log('No crm-maintenance-records.json rows.')
    return
  }
  const rows = records.map((r) => ({
    id: asUuid(r.id, 'maint-record'),
    project_id: mapProjectId(r.projectId),
    period_key: String(r.periodKey),
    paid_amount: Math.max(0, Number(r.paidAmount) || 0),
    paid_on: parseDate(r.paidOn),
    note: String(r.note ?? ''),
    updated_at: r.updatedAt || new Date().toISOString(),
  }))
  if (dryRun) {
    console.log(`[dry-run] ${rows.length} maintenance record(s)`)
    return
  }
  const { error } = await supabase.from('crm_maintenance_payment_records').upsert(rows)
  throwIfDbError('maintenance records', error)
  console.log(`Migrated ${rows.length} maintenance payment record(s).`)
}

async function migrateMaintenanceSettings() {
  const settings = await readJson('crm-maintenance-settings.json', null)
  if (!settings || typeof settings !== 'object') {
    console.log('No crm-maintenance-settings.json — keeping DB default.')
    return
  }
  const row = {
    id: 'default',
    clearance_day: Math.min(28, Math.max(1, Math.round(Number(settings.clearanceDay) || 21))),
    updated_at: settings.updatedAt || new Date().toISOString(),
  }
  if (dryRun) {
    console.log('[dry-run] maintenance settings', row)
    return
  }
  const { error } = await supabase.from('crm_maintenance_settings').upsert(row)
  throwIfDbError('maintenance settings', error)
  console.log('Migrated maintenance settings.')
}

async function migrateFinance() {
  const entries = await readJson('crm-finance.json', [])
  if (!Array.isArray(entries) || entries.length === 0) {
    console.log('No crm-finance.json rows.')
    return
  }
  const rows = entries.map((e) => ({
    id: asUuid(e.id, 'finance'),
    kind: e.kind === 'cost' ? 'cost' : 'salary',
    label: String(e.label ?? ''),
    amount: Number(e.amount) || 0,
    month: String(e.month),
    note: String(e.note ?? ''),
    created_at: e.createdAt || new Date().toISOString(),
  }))
  if (dryRun) {
    console.log(`[dry-run] ${rows.length} finance entr(ies)`)
    return
  }
  const { error } = await supabase.from('crm_finance_entries').upsert(rows)
  throwIfDbError('finance', error)
  console.log(`Migrated ${rows.length} finance entr(ies).`)
}

async function migrateMonthlyExpenses() {
  const expenses = await readJson('crm-monthly-expenses.json', [])
  if (!Array.isArray(expenses) || expenses.length === 0) {
    console.log('No crm-monthly-expenses.json rows.')
    return
  }
  const rows = expenses.map((e) => ({
    id: asUuid(e.id, 'expense'),
    title: String(e.title ?? ''),
    amount: Math.max(0, Number(e.amount) || 0),
    due_day: Math.min(28, Math.max(1, Math.round(Number(e.dueDay) || 1))),
    remind_days_before: Math.min(7, Math.max(2, Math.round(Number(e.remindDaysBefore) || 3))),
    category: String(e.category ?? ''),
    note: String(e.note ?? ''),
    active: e.active !== false,
    created_at: e.createdAt || new Date().toISOString(),
    updated_at: e.updatedAt || new Date().toISOString(),
  }))
  if (dryRun) {
    console.log(`[dry-run] ${rows.length} monthly expense(s)`)
    return
  }
  const { error } = await supabase.from('crm_monthly_expenses').upsert(rows)
  throwIfDbError('monthly expenses', error)
  console.log(`Migrated ${rows.length} monthly expense(s).`)
}

async function migrateInvoiceShares() {
  const shares = await readJson('crm-invoice-shares.json', [])
  if (!Array.isArray(shares) || shares.length === 0) {
    console.log('No crm-invoice-shares.json rows.')
    return
  }
  const rows = shares.map((s) => ({
    id: asUuid(s.id, 'share'),
    project_id: s.projectId ? mapProjectId(s.projectId) : null,
    period_key: String(s.periodKey),
    invoice_number: String(s.invoiceNumber ?? ''),
    props: s.props ?? {},
    created_at: s.createdAt || new Date().toISOString(),
  }))
  if (dryRun) {
    console.log(`[dry-run] ${rows.length} invoice share(s)`)
    return
  }
  const { error } = await supabase.from('crm_maintenance_invoice_shares').upsert(rows)
  throwIfDbError('invoice shares', error)
  console.log(`Migrated ${rows.length} invoice share(s).`)
}

async function main() {
  console.log(dryRun ? '--- DRY RUN ---' : '--- Migrating JSON → Supabase ---')
  if (wipe) await wipeTables()
  await migrateProjects()
  await migrateMaintenanceRecords()
  await migrateMaintenanceSettings()
  await migrateFinance()
  await migrateMonthlyExpenses()
  await migrateInvoiceShares()
  console.log('Done.')
  if (!dryRun) {
    console.log('\nNext: set CRM_DATA_BACKEND=supabase in .env.local when API stores are wired to Supabase.')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
