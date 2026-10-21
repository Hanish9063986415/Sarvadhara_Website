import { NextResponse } from 'next/server'
import { canAccessProjectWorkspaceData } from '@/lib/automate-projects-api-auth'
import { saveProjectDocumentFile } from '@/lib/crm-project-documents'
import { getCrmProject, setCrmProjectDocuments } from '@/lib/crm-projects-store'

export const runtime = 'nodejs'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  if (!(await canAccessProjectWorkspaceData())) {
    return NextResponse.json({ error: 'Automate sign-in required.' }, { status: 401 })
  }
  const project = await getCrmProject(params.id)
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }
  return NextResponse.json({ documents: project.documents ?? [] })
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!(await canAccessProjectWorkspaceData())) {
    return NextResponse.json({ error: 'Automate sign-in required.' }, { status: 401 })
  }

  const project = await getCrmProject(params.id)
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  const form = await request.formData().catch(() => null)
  if (!form) {
    return NextResponse.json({ error: 'Invalid upload.' }, { status: 400 })
  }

  const file = form.get('file')
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'Choose a file to upload.' }, { status: 400 })
  }

  const labelRaw = form.get('label')
  const label = typeof labelRaw === 'string' ? labelRaw : 'Signed proposal'

  if ((project.documents?.length ?? 0) >= 30) {
    return NextResponse.json({ error: 'Maximum 30 documents per project.' }, { status: 400 })
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const meta = await saveProjectDocumentFile(
      params.id,
      buffer,
      file.type || 'application/octet-stream',
      file.name || 'document',
      label
    )
    const nextDocs = [...(project.documents ?? []), meta]
    const updated = await setCrmProjectDocuments(params.id, nextDocs)
    return NextResponse.json({ document: meta, project: updated })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
