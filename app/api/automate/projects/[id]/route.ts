import { NextResponse } from 'next/server'
import {
  canAccessProjectWorkspaceData,
  isCeoVaultAuthenticated,
} from '@/lib/automate-projects-api-auth'
import { parseCrmProjectBody } from '@/lib/crm-project-api-parse'
import { deleteMaintenanceRecordsForProject } from '@/lib/crm-maintenance-records-store'
import { deleteCrmProject, getCrmProject, updateCrmProject } from '@/lib/crm-projects-store'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await canAccessProjectWorkspaceData())) {
    return NextResponse.json({ error: 'Automate sign-in required.' }, { status: 401 })
  }
  const project = await getCrmProject(params.id)
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }
  const canDelete = await isCeoVaultAuthenticated()
  return NextResponse.json({ project, canDelete })
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const parsed = parseCrmProjectBody(await request.json().catch(() => null))
  if (!parsed) {
    return NextResponse.json({ error: 'Invalid project payload' }, { status: 400 })
  }

  if (!(await canAccessProjectWorkspaceData())) {
    return NextResponse.json({ error: 'Automate sign-in required.' }, { status: 401 })
  }

  const project = await updateCrmProject(id, parsed)
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }
  return NextResponse.json({ project })
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await canAccessProjectWorkspaceData())) {
    return NextResponse.json({ error: 'Automate sign-in required.' }, { status: 401 })
  }
  if (!(await isCeoVaultAuthenticated())) {
    return NextResponse.json(
      { error: 'Only an admin can delete a project. Sign in with the admin account.' },
      { status: 403 }
    )
  }
  const { id } = params
  const ok = await deleteCrmProject(id)
  if (!ok) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }
  await deleteMaintenanceRecordsForProject(id)
  return NextResponse.json({ ok: true })
}

