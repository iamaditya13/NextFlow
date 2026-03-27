import { auth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
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

    const run = await prisma.workflowRun.findFirst({
      where: { id: runId, userId: user.id },
      include: {
        nodeResults: {
          orderBy: { startedAt: 'asc' },
        },
      },
    })

    if (!run) {
      return Response.json({ error: 'Run not found' }, { status: 404 })
    }

    return Response.json({ run })
  } catch (e) {
    console.error('GET /api/executions/[runId]:', e)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}

export const runtime = 'nodejs'
