import { NextRequest } from 'next/server'
import { tasks, runs } from '@trigger.dev/sdk/v3'
import { z } from 'zod'
import { authenticateUser, success, error, zodError } from '@/lib/apiHelpers'

const schema = z.object({
  videoUrl: z.string().url(),
  timestamp: z.string().default('50%'),
})

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms)
    ),
  ])
}

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

    const handle = await tasks.trigger('extract-frame', {
      videoUrl: parsed.videoUrl,
      timestamp: parsed.timestamp,
      runId: '__standalone__',
      nodeId: '__standalone__',
    })

    const result = await withTimeout(
      runs.poll(handle.id, { pollIntervalMs: 300 }),
      90_000,
      'Extract frame task'
    )

    if (!result.output) {
      return error('Extract frame task produced no output', 500)
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
export const maxDuration = 120
