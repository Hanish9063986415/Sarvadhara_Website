import { NextResponse } from 'next/server'
import { canAccessProjectWorkspaceData } from '@/lib/automate-projects-api-auth'
import { deleteProjectDocumentFile, readProjectDocumentFile } from '@/lib/crm-project-documents'
import { getCrmProject, setCrmProjectDocuments } from '@/lib/crm-projects-store'

export const runtime = 'nodejs'

export async function GET(
  _request: Request,
  { params }: { params: { id: string; docId: string } }
) {
  if (!(await canAccessProjectWorkspaceData())) {
    return NextResponse.json({ error: 'Automate sign-in required.' }, { status: 401 })
  }

  const project = await getCrmProject(params.id)
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  const doc = project.documents?.find((d) => d.id === params.docId)
  if (!doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  const file = await readProjectDocumentFile(params.id, doc)
  if (!file) {
    return NextResponse.json({ error: 'File missing on server' }, { status: 404 })
  }

  const safeName = doc.fileName.replace(/[^\w.\-() ]+/g, '_')
  return new NextResponse(new Uint8Array(file.buffer), {
    headers: {
      'Content-Type': doc.mimeType,
      'Content-Disposition': `inline; filename="${safeName}"`,
      'Cache-Control': 'private, no-store',
    },
  })
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string; docId: string } }
) {
  if (!(await canAccessProjectWorkspaceData())) {
    return NextResponse.json({ error: 'Automate sign-in required.' }, { status: 401 })
  }

  const project = await getCrmProject(params.id)
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  const doc = project.documents?.find((d) => d.id === params.docId)
  if (!doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  await deleteProjectDocumentFile(params.id, doc)
  const nextDocs = project.documents.filter((d) => d.id !== params.docId)
  const updated = await setCrmProjectDocuments(params.id, nextDocs)
  return NextResponse.json({ ok: true, project: updated })
}
