import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateUser, success, error } from '@/lib/apiHelpers'

export async function GET(req: NextRequest) {
  try {
    const [user, authError] = await authenticateUser()
    if (authError) return authError

    const { searchParams } = new URL(req.url)
    const workflowId = searchParams.get('workflowId')

    const runs = await prisma.workflowRun.findMany({
      where: {
        userId: user.id,
        ...(workflowId ? { workflowId } : {}),
      },
      include: {
        nodeResults: {
          orderBy: { startedAt: 'asc' },
        },
      },
      orderBy: { startedAt: 'desc' },
      take: 50,
    })

    return success(runs)
  } catch (e) {
    return error('Internal server error', 500)
  }
}
