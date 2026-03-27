import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateUser, success, error } from '@/lib/apiHelpers'

export async function GET(req: NextRequest) {
  try {
    const [user, authError] = await authenticateUser()
    if (authError) return authError

    const { searchParams } = new URL(req.url)
    const workflowId = searchParams.get('workflowId')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)

    const where: Record<string, unknown> = { userId: user.id }
    if (workflowId) where.workflowId = workflowId

    const runs = await prisma.workflowRun.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      take: limit,
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

export async function POST(req: NextRequest) {
  try {
    const [user, authError] = await authenticateUser()
    if (authError) return authError

    const body = await req.json()
    const { workflowId, scope, nodeResults } = body

    if (!workflowId) return error('workflowId is required', 400)

    // Verify workflow ownership
    const workflow = await prisma.workflow.findFirst({
      where: { id: workflowId, userId: user.id },
      select: { id: true },
    })
    if (!workflow) return error('Workflow not found', 404)

    const run = await prisma.workflowRun.create({
      data: {
        workflowId,
        userId: user.id,
        status: 'RUNNING',
        scope: scope || 'FULL',
      },
    })

    // Optionally create node results if provided
    if (Array.isArray(nodeResults) && nodeResults.length > 0) {
      await prisma.nodeResult.createMany({
        data: nodeResults.map((nr: { nodeId: string; nodeName?: string; nodeType?: string }) => ({
          runId: run.id,
          nodeId: nr.nodeId,
          nodeName: nr.nodeName || 'Unknown',
          nodeType: nr.nodeType || 'unknown',
          status: 'PENDING' as const,
        })),
      })
    }

    return success(run, 201)
  } catch (e) {
    return error('Internal server error', 500)
  }
}

export const runtime = 'nodejs'
