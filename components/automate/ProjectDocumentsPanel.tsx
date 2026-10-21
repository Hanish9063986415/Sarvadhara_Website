'use client'

import { useRef, useState } from 'react'
import { Download, FileSignature, FileText, Loader2, Trash2, Upload } from 'lucide-react'
import { formatCrmDateTime } from '@/lib/crm-dates'
import { formatDocumentSize } from '@/lib/format-document-size'
import type { CrmProject, CrmProjectDocument } from '@/types/crm-project'

function docIcon(mimeType: string) {
  if (mimeType === 'application/pdf') return FileText
  return FileSignature
}

export default function ProjectDocumentsPanel({
  project,
  onSaved,
}: {
  project: CrmProject
  onSaved: (project: CrmProject) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [label, setLabel] = useState('Signed proposal')
  const [uploading, setUploading] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const documents = project.documents ?? []

  async function uploadFile(file: File) {
    setUploading(true)
    setError(null)
    const form = new FormData()
    form.set('file', file)
    form.set('label', label.trim() || 'Signed proposal')
    const res = await fetch(`/api/automate/projects/${project.id}/documents`, {
      method: 'POST',
      body: form,
    })
    setUploading(false)
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      setError(data.error ?? 'Upload failed.')
      return
    }
    const data = (await res.json()) as { project: CrmProject }
    onSaved(data.project)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleDelete(doc: CrmProjectDocument) {
    if (!window.confirm(`Remove “${doc.label}”?`)) return
    setRemovingId(doc.id)
    setError(null)
    const res = await fetch(`/api/automate/projects/${project.id}/documents/${doc.id}`, {
      method: 'DELETE',
    })
    setRemovingId(null)
    if (!res.ok) {
      setError('Could not remove document.')
      return
    }
    const data = (await res.json()) as { project: CrmProject }
    onSaved(data.project)
  }

  function onDrop(event: React.DragEvent) {
    event.preventDefault()
    setDragOver(false)
    const file = event.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }

  const downloadHref = (docId: string) => `/api/automate/projects/${project.id}/documents/${docId}`

  return (
    <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/[0.06] via-white/[0.02] to-transparent p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.16em] text-emerald-200/80">Signed proposals & documents</h3>
          <p className="mt-1 max-w-xl text-xs text-platinum-500">
            Store signed proposals, contracts, and scans on this project. PDF, Word, and images up to 15 MB.
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-wider text-platinum-500 tabular-nums">
          {documents.length} file{documents.length === 1 ? '' : 's'}
        </span>
      </div>

      <div
        className={`mt-5 rounded-2xl border border-dashed p-5 transition-colors ${
          dragOver ? 'border-emerald-400/40 bg-emerald-500/10' : 'border-white/15 bg-black/20'
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="crm-label" htmlFor={`doc-label-${project.id}`}>
              Document title
            </label>
            <input
              id={`doc-label-${project.id}`}
              className="crm-input"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Signed proposal"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,application/pdf,image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) uploadFile(file)
              }}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-2.5 text-xs uppercase tracking-wider text-emerald-100 hover:bg-emerald-500/25 disabled:opacity-50"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Upload file
            </button>
          </div>
        </div>
        <p className="mt-3 text-center text-[11px] text-platinum-600 sm:text-left">or drop a file here</p>
      </div>

      {error && (
        <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>
      )}

      {documents.length > 0 ? (
        <ul className="mt-5 space-y-3">
          {documents.map((doc) => {
            const Icon = docIcon(doc.mimeType)
            return (
              <li
                key={doc.id}
                className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/25 p-4 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/10">
                    <Icon className="h-6 w-6 text-emerald-200/90" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-platinum-metallic truncate">{doc.label}</p>
                    <p className="mt-0.5 truncate text-xs text-platinum-500">{doc.fileName}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-platinum-600">
                      {formatDocumentSize(doc.sizeBytes)} · Added {formatCrmDateTime(doc.uploadedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2 sm:ml-auto">
                  <a
                    href={downloadHref(doc.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-[10px] uppercase tracking-wider text-platinum-300 hover:text-platinum-metallic"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Open
                  </a>
                  <button
                    type="button"
                    disabled={removingId === doc.id}
                    onClick={() => handleDelete(doc)}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-400/20 px-3 py-2 text-[10px] uppercase tracking-wider text-red-200/90 hover:bg-red-500/10 disabled:opacity-50"
                  >
                    {removingId === doc.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    Remove
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="mt-5 text-sm text-platinum-500">No documents yet. Upload a signed proposal or contract above.</p>
      )}
    </section>
  )
}
