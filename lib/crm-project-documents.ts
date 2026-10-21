import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import type { CrmProjectDocument } from '@/types/crm-project'

export const CRM_PROJECT_DOCUMENTS_ROOT = path.join(process.cwd(), 'data', 'crm-project-documents')

export const MAX_PROJECT_DOCUMENT_BYTES = 15 * 1024 * 1024

const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'image/webp',
])

const EXT_BY_MIME: Record<string, string> = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
}

export function isAllowedProjectDocument(mimeType: string): boolean {
  return ALLOWED_MIME.has(mimeType)
}

function extensionFor(mimeType: string, originalName: string): string {
  const fromMime = EXT_BY_MIME[mimeType]
  if (fromMime) return fromMime
  const ext = path.extname(originalName).toLowerCase()
  if (['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
    return ext === '.jpeg' ? '.jpg' : ext
  }
  return '.bin'
}

export function projectDocumentDiskPath(projectId: string, docId: string, ext: string): string {
  const safeProject = projectId.replace(/[^a-zA-Z0-9-]/g, '')
  const safeDoc = docId.replace(/[^a-zA-Z0-9-]/g, '')
  return path.join(CRM_PROJECT_DOCUMENTS_ROOT, safeProject, `${safeDoc}${ext}`)
}

export async function saveProjectDocumentFile(
  projectId: string,
  file: Buffer,
  mimeType: string,
  originalName: string,
  label: string
): Promise<CrmProjectDocument> {
  if (!isAllowedProjectDocument(mimeType)) {
    throw new Error('Unsupported file type. Use PDF, Word, or image files.')
  }
  if (file.length > MAX_PROJECT_DOCUMENT_BYTES) {
    throw new Error('File is too large (max 15 MB).')
  }

  const id = randomUUID()
  const ext = extensionFor(mimeType, originalName)
  const diskPath = projectDocumentDiskPath(projectId, id, ext)
  await fs.mkdir(path.dirname(diskPath), { recursive: true })
  await fs.writeFile(diskPath, file)

  return {
    id,
    label: label.trim().slice(0, 120) || 'Signed document',
    fileName: originalName.trim().slice(0, 255) || `document${ext}`,
    mimeType,
    sizeBytes: file.length,
    uploadedAt: new Date().toISOString(),
  }
}

export async function readProjectDocumentFile(
  projectId: string,
  doc: CrmProjectDocument
): Promise<{ buffer: Buffer; ext: string } | null> {
  const ext = extensionFor(doc.mimeType, doc.fileName)
  const diskPath = projectDocumentDiskPath(projectId, doc.id, ext)
  try {
    const buffer = await fs.readFile(diskPath)
    return { buffer, ext }
  } catch {
    return null
  }
}

export async function deleteProjectDocumentFile(projectId: string, doc: CrmProjectDocument): Promise<void> {
  const ext = extensionFor(doc.mimeType, doc.fileName)
  const diskPath = projectDocumentDiskPath(projectId, doc.id, ext)
  await fs.unlink(diskPath).catch(() => {})
}

export async function deleteProjectDocumentFiles(projectId: string): Promise<void> {
  const safeProject = projectId.replace(/[^a-zA-Z0-9-]/g, '')
  const dir = path.join(CRM_PROJECT_DOCUMENTS_ROOT, safeProject)
  await fs.rm(dir, { recursive: true, force: true }).catch(() => {})
}
