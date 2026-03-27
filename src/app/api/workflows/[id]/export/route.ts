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
    const workflow = await prisma.workflow.findFirst({
      where: { id, userId: user.id },
    })

    if (!workflow) return error('Workflow not found', 404)

    const data = workflow.data as { nodes?: unknown[]; edges?: unknown[] }
    const exportPayload = {
      name: workflow.name,
      nodes: data.nodes || [],
      edges: data.edges || [],
      exportedAt: new Date().toISOString(),
      version: '1.0',
    }

    return new Response(JSON.stringify(exportPayload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="workflow-${id}.json"`,
      },
    })
  } catch (e) {
    return error('Internal server error', 500)
  }
}

export const runtime = 'nodejs'
