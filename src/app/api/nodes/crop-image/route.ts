import { NextRequest } from 'next/server'
import { z } from 'zod'
import { authenticateUser, success, error, zodError } from '@/lib/apiHelpers'
import { triggerTaskAndPoll } from '@/lib/triggerTaskRunner'

const schema = z.object({
  imageUrl: z.string().url(),
  xPercent: z.number().min(0).max(100).default(0),
  yPercent: z.number().min(0).max(100).default(0),
  widthPercent: z.number().min(1).max(100).default(100),
  heightPercent: z.number().min(1).max(100).default(100),
})

export async function POST(req: NextRequest) {
  try {
    const [, authError] = await authenticateUser()
    if (authError) return authError

    const body = await req.json()
    let parsed
    try {
      parsed = schema.parse(body)
    } catch (e) {
      return zodError(e)
    }

    const { output } = await triggerTaskAndPoll(
      'crop-image',
      {
        imageUrl: parsed.imageUrl,
        xPercent: parsed.xPercent,
        yPercent: parsed.yPercent,
        widthPercent: parsed.widthPercent,
        heightPercent: parsed.heightPercent,
        runId: '__standalone__',
        nodeId: '__standalone__',
      },
      { label: 'Crop image task', pollIntervalMs: 300, timeoutMs: 90_000 }
    )

    const outputUrl = (output as { url?: string }).url
    if (!outputUrl) {
      return error('Crop image task returned no URL', 500)
    }

    return success({ output: outputUrl })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal server error'
    return error(message, 500)
  }
}

export const runtime = 'nodejs'
export const maxDuration = 120
