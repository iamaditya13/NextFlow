import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateUser, success, error } from '@/lib/apiHelpers'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [user, authError] = await authenticateUser()
    if (authError) return authError

    const { id } = await params

    const run = await prisma.workflowRun.findFirst({
      where: { id, userId: user.id },
      include: {
        nodeResults: {
          orderBy: { startedAt: 'asc' },
        },
      },
    })

    if (!run) return error('Run not found', 404)

    return success(run)
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

    const existing = await prisma.workflowRun.findFirst({
      where: { id, userId: user.id },
    })

    if (!existing) return error('Run not found', 404)

    const updateData: Record<string, unknown> = {}

    if (body.status) updateData.status = body.status
    if (body.completedAt) updateData.completedAt = new Date(body.completedAt)
    if (body.duration !== undefined) updateData.duration = body.duration

    const updated = await prisma.workflowRun.update({
      where: { id },
      data: updateData,
      include: {
        nodeResults: {
          orderBy: { startedAt: 'asc' },
        },
      },
    })

    return success(updated)
  } catch (e) {
    return error('Internal server error', 500)
  }
}

export const runtime = 'nodejs'
