import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TriggerRunSchema } from '@/lib/validations'
import { authenticateUser, success, error, zodError } from '@/lib/apiHelpers'
import { executeWorkflow } from '@/lib/executionEngine'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [user, authError] = await authenticateUser()
    if (authError) return authError

    const { id } = await params

    const workflow = await prisma.workflow.findFirst({
      where: { id, userId: user.id },
    })

    if (!workflow) return error('Workflow not found', 404)

    const body = await req.json()
    let parsed
    try {
      parsed = TriggerRunSchema.parse(body)
    } catch (e) {
      return zodError(e)
    }

    const workflowData = workflow.data as { nodes?: unknown[]; edges?: unknown[] }
    const nodes = (workflowData.nodes || []) as Array<{ id: string; type: string; data: unknown }>
    const edges = (workflowData.edges || []) as Array<{
      id: string
      source: string
      sourceHandle: string
      target: string
      targetHandle: string
    }>

    // Validate nodeIds for PARTIAL/SINGLE scope
    if (parsed.scope !== 'FULL') {
      if (!parsed.nodeIds || parsed.nodeIds.length === 0) {
        return error('nodeIds required for PARTIAL/SINGLE scope', 400)
      }
    }

    const run = await prisma.workflowRun.create({
      data: {
        workflowId: id,
        userId: user.id,
        status: 'RUNNING',
        scope: parsed.scope,
      },
    })

    // Fire-and-forget execution
    executeWorkflow(
      id,
      user.id,
      nodes,
      edges,
      parsed.scope.toLowerCase() as 'full' | 'partial' | 'single',
      parsed.nodeIds,
      run.id
    ).catch(async (err) => {
      await prisma.workflowRun.update({
        where: { id: run.id },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
        },
      })
    })

    return success({ runId: run.id, status: 'RUNNING' })
  } catch (e) {
    return error('Internal server error', 500)
  }
}

export const runtime = 'nodejs'
