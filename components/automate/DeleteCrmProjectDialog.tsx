'use client'

import CrmConfirmDialog from '@/components/automate/CrmConfirmDialog'

export default function DeleteCrmProjectDialog({
  open,
  projectName,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean
  projectName: string
  loading?: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
}) {
  return (
    <CrmConfirmDialog
      open={open}
      tone="danger"
      title="Delete this project?"
      description={
        <>
          <span className="font-medium text-platinum-200">{projectName}</span> will be removed permanently from
          Supabase, including tasks, payments, document metadata, and maintenance records. Uploaded files on the server
          are deleted when possible. This cannot be undone.
        </>
      }
      confirmLabel="Delete project"
      loading={loading}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  )
}

export async function deleteCrmProjectRequest(projectId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch(`/api/automate/projects/${projectId}`, { method: 'DELETE' })
  if (res.ok) return { ok: true }
  const data = (await res.json().catch(() => ({}))) as { error?: string }
  return { ok: false, error: data.error ?? 'Could not delete this project.' }
}
