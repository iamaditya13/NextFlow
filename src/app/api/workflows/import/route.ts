import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { ImportWorkflowSchema } from '@/lib/validations'
import { authenticateUser, success, error, zodError } from '@/lib/apiHelpers'

export async function POST(req: NextRequest) {
  try {
    const [user, authError] = await authenticateUser()
    if (authError) return authError

    const body = await req.json()
    let parsed
    try {
      parsed = ImportWorkflowSchema.parse(body)
    } catch (e) {
      return zodError(e)
    }

    let workflowData: { name?: string; nodes?: unknown[]; edges?: unknown[] }
    try {
      workflowData = JSON.parse(parsed.workflowJson)
    } catch {
      return error('Invalid JSON format', 400)
    }

    if (!workflowData || typeof workflowData !== 'object') {
      return error('Invalid workflow data', 400)
    }

    const workflow = await prisma.workflow.create({
      data: {
        name: workflowData.name || 'Imported Workflow',
        data: {
          nodes: Array.isArray(workflowData.nodes) ? workflowData.nodes : [],
          edges: Array.isArray(workflowData.edges) ? workflowData.edges : [],
        } as unknown as Prisma.InputJsonValue,
        userId: user.id,
      },
    })

    return success(workflow, 201)
  } catch (e) {
    return error('Internal server error', 500)
  }
}
