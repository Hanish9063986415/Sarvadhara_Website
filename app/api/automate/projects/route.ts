import { NextResponse } from 'next/server'
import {
  canAccessProjectWorkspaceData,
  isCeoVaultAuthenticated,
} from '@/lib/automate-projects-api-auth'
import { createCrmProject, listCrmProjects } from '@/lib/crm-projects-store'
import { parseCrmProjectBody } from '@/lib/crm-project-api-parse'

export async function GET() {
  if (!(await canAccessProjectWorkspaceData())) {
    return NextResponse.json({ error: 'Automate sign-in required.' }, { status: 401 })
  }
  const projects = await listCrmProjects()
  const canDelete = await isCeoVaultAuthenticated()
  return NextResponse.json({ projects, canDelete })
}

export async function POST(request: Request) {
  if (!(await canAccessProjectWorkspaceData())) {
    return NextResponse.json({ error: 'Automate sign-in required.' }, { status: 401 })
  }
  const input = parseCrmProjectBody(await request.json().catch(() => null))
  if (!input) {
    return NextResponse.json({ error: 'Invalid project payload' }, { status: 400 })
  }
  const project = await createCrmProject(input)
  return NextResponse.json({ project }, { status: 201 })
}
