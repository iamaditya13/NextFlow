import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreateWorkflowSchema } from '@/lib/validations'
import { authenticateUser, success, error, zodError } from '@/lib/apiHelpers'

export async function GET(req: NextRequest) {
  try {
    const [user, authError] = await authenticateUser()
    if (authError) return authError

    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const workflows = await prisma.workflow.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        name: true,
        updatedAt: true,
        createdAt: true,
        _count: { select: { runs: true } },
      },
    })

    return success(workflows)
  } catch (e) {
    return error('Internal server error', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const [user, authError] = await authenticateUser()
    if (authError) return authError

    const body = await req.json()
    let parsed
    try {
      parsed = CreateWorkflowSchema.parse(body)
    } catch (e) {
      return zodError(e)
    }

    const workflow = await prisma.workflow.create({
      data: {
        name: parsed.name,
        data: { nodes: [], edges: [] },
        userId: user.id,
      },
    })

    return success(workflow, 201)
  } catch (e) {
    return error('Internal server error', 500)
  }
}
