import { auth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { runId } = await params

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.workflowRun.updateMany({
      where: { id: runId, userId: user.id },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
      },
    })

    await prisma.nodeResult.updateMany({
      where: {
        runId,
        status: { in: ['RUNNING', 'PENDING'] },
      },
      data: {
        status: 'FAILED',
        error: 'Cancelled by user',
        completedAt: new Date(),
      },
    })

    return Response.json({ success: true })
  } catch (e) {
    console.error('POST /api/executions/[runId]/cancel:', e)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
