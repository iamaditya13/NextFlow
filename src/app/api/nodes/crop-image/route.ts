import { NextRequest } from 'next/server'
import { tasks, runs } from '@trigger.dev/sdk/v3'
import { z } from 'zod'
import { authenticateUser, success, error, zodError } from '@/lib/apiHelpers'

const schema = z.object({
  imageUrl: z.string().url(),
  xPercent: z.number().min(0).max(100).default(0),
  yPercent: z.number().min(0).max(100).default(0),
  widthPercent: z.number().min(1).max(100).default(100),
  heightPercent: z.number().min(1).max(100).default(100),
})

export async function POST(req: NextRequest) {
  try {
    const [user, authError] = await authenticateUser()
    if (authError) return authError

    const body = await req.json()
    let parsed
    try {
      parsed = schema.parse(body)
    } catch (e) {
      return zodError(e)
    }

    const handle = await tasks.trigger('crop-image', {
      imageUrl: parsed.imageUrl,
      xPercent: parsed.xPercent,
      yPercent: parsed.yPercent,
      widthPercent: parsed.widthPercent,
      heightPercent: parsed.heightPercent,
      runId: '__standalone__',
      nodeId: '__standalone__',
    })

    const result = await runs.poll(handle.id, { pollIntervalMs: 1000 })

    if (!result.output) {
      return error('Crop image task produced no output', 500)
    }

    return success({
      output: (result.output as { url?: string }).url ?? result.output,
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal server error'
    return error(message, 500)
  }
}

export const runtime = 'nodejs'
