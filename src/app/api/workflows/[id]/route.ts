import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UpdateWorkflowSchema } from '@/lib/validations'
import { authenticateUser, success, error, zodError } from '@/lib/apiHelpers'

async function getOwnedWorkflow(workflowId: string, userId: string) {
  return prisma.workflow.findFirst({
    where: { id: workflowId, userId },
  })
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [user, authError] = await authenticateUser()
    if (authError) return authError

    const { id } = await params
    const workflow = await prisma.workflow.findFirst({
      where: { id, userId: user.id },
      include: {
        runs: {
          orderBy: { startedAt: 'desc' },
          take: 20,
          include: { nodeResults: { orderBy: { startedAt: 'asc' } } },
        },
      },
    })

    if (!workflow) return error('Workflow not found', 404)

    return success(workflow)
  } catch (e) {
    return error('Internal server error', 500)
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [user, authError] = await authenticateUser()
    if (authError) return authError

    const { id } = await params
    const body = await req.json()

    // Legacy support: accept { name, data } format
    if (body.data && !body.nodes && !body.edges) {
      await prisma.workflow.updateMany({
        where: { id, userId: user.id },
        data: {
          ...(body.name !== undefined ? { name: body.name } : {}),
          data: body.data,
          updatedAt: new Date(),
        },
      })
      return success({ updated: true })
    }

    return PATCH(req, { params: Promise.resolve({ id }) }, body)
  } catch (e) {
    return error('Internal server error', 500)
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
  preBody?: unknown
) {
  try {
    const [user, authError] = await authenticateUser()
    if (authError) return authError

    const { id } = await params
    const body = preBody || (await req.json())

    let parsed
    try {
      parsed = UpdateWorkflowSchema.parse(body)
    } catch (e) {
      return zodError(e)
    }

    const existing = await getOwnedWorkflow(id, user.id)
    if (!existing) return error('Workflow not found', 404)

    const currentData = (existing.data as { nodes?: unknown[]; edges?: unknown[] }) || {}
    const updateData: Record<string, unknown> = { updatedAt: new Date() }

    if (parsed.name !== undefined) updateData.name = parsed.name
    if (parsed.nodes !== undefined || parsed.edges !== undefined) {
      updateData.data = {
        nodes: parsed.nodes ?? currentData.nodes ?? [],
        edges: parsed.edges ?? currentData.edges ?? [],
      }
    }

    const updated = await prisma.workflow.update({
      where: { id },
      data: updateData,
    })

    return success(updated)
  } catch (e) {
    return error('Internal server error', 500)
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [user, authError] = await authenticateUser()
    if (authError) return authError

    const { id } = await params
    const existing = await getOwnedWorkflow(id, user.id)
    if (!existing) return error('Workflow not found', 404)

    await prisma.workflow.delete({ where: { id } })

    return success({ deleted: true })
  } catch (e) {
    return error('Internal server error', 500)
  }
}
