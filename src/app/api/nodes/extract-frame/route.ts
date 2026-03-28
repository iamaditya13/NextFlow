import { NextRequest } from 'next/server'
import { z } from 'zod'
import { authenticateUser, success, error, zodError } from '@/lib/apiHelpers'
import { triggerTaskAndPoll } from '@/lib/triggerTaskRunner'

const schema = z.object({
  videoUrl: z.string().url(),
  timestamp: z.string().default('50%'),
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
      'extract-frame',
      {
        videoUrl: parsed.videoUrl,
        timestamp: parsed.timestamp,
        runId: '__standalone__',
        nodeId: '__standalone__',
      },
      { label: 'Extract frame task', pollIntervalMs: 300, timeoutMs: 90_000 }
    )

    const outputUrl = (output as { url?: string }).url
    if (!outputUrl) {
      return error('Extract frame task returned no URL', 500)
    }

    return success({ output: outputUrl })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal server error'
    return error(message, 500)
  }
}

export const runtime = 'nodejs'
export const maxDuration = 120
