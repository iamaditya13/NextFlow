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

    // Verify workflow ownership
    const workflow = await prisma.workflow.findFirst({
      where: { id, userId: user.id },
      select: { id: true },
    })

    if (!workflow) return error('Workflow not found', 404)

    const runs = await prisma.workflowRun.findMany({
      where: { workflowId: id, userId: user.id },
      orderBy: { startedAt: 'desc' },
      take: 50,
      include: {
        nodeResults: {
          orderBy: { startedAt: 'asc' },
        },
      },
    })

    return success(runs)
  } catch (e) {
    return error('Internal server error', 500)
  }
}
