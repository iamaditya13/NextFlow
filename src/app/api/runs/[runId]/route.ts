import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateUser, success, error } from '@/lib/apiHelpers'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const [user, authError] = await authenticateUser()
    if (authError) return authError

    const { runId } = await params

    const run = await prisma.workflowRun.findFirst({
      where: { id: runId, userId: user.id },
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
