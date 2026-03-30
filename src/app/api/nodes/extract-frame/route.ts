import { NextRequest } from 'next/server'
import { z } from 'zod'
import { authenticateUser, success, error, zodError } from '@/lib/apiHelpers'
import { triggerTaskAndPoll } from '@/lib/triggerTaskRunner'

const httpUrlSchema = z
  .string()
  .url()
  .refine((value) => {
    const protocol = new URL(value).protocol
    return protocol === 'http:' || protocol === 'https:'
  }, 'Must be a valid http(s) URL')

function isValidTimestampInput(value: string): boolean {
  const normalized = value.trim()
  if (normalized.length === 0) return false

  const secondPattern = /^\d+(\.\d+)?$/
  const percentagePattern = /^\d+(\.\d+)?%$/
  const timecodePattern = /^\d{1,2}:\d{1,2}(:\d{1,2}(\.\d+)?)?$/

  return (
    secondPattern.test(normalized) ||
    percentagePattern.test(normalized) ||
    timecodePattern.test(normalized)
  )
}

const schema = z.object({
  videoUrl: httpUrlSchema,
  timestamp: z.string().trim().default('50%').refine(isValidTimestampInput, {
    message: 'timestamp must be seconds (e.g. 12.5), percentage (e.g. 50%), or timecode (mm:ss or hh:mm:ss)',
  }),
})

function createRequestId(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID().slice(0, 8)
    : Date.now().toString(36)
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  return 'Internal server error'
}

function getStatusFromMessage(message: string): number {
  if (message.includes('queued and was never picked up')) return 503
  if (message.toLowerCase().includes('validation')) return 400
  if (message.toLowerCase().includes('invalid')) return 400
  return 500
}

function summarizeUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl)
    return `${url.protocol}//${url.host}${url.pathname}`
  } catch {
    return rawUrl
  }
}

export async function POST(req: NextRequest) {
  const requestId = createRequestId()
  const startedAt = Date.now()
  const routeLabel = 'POST /api/nodes/extract-frame'

  console.log(`[${routeLabel}] [${requestId}] request received`)

  try {
    const [, authError] = await authenticateUser()
    if (authError) return authError

    let body: unknown
    try {
      body = await req.json()
    } catch (parseError: unknown) {
      console.error(`[${routeLabel}] [${requestId}] invalid JSON body`, parseError)
      return error(`Invalid JSON request body (requestId: ${requestId})`, 400)
    }

    let parsed
    try {
      parsed = schema.parse(body)
    } catch (e) {
      console.error(`[${routeLabel}] [${requestId}] payload validation failed`, e)
      return zodError(e)
    }

    console.log(`[${routeLabel}] [${requestId}] payload validated`, {
      videoUrl: summarizeUrl(parsed.videoUrl),
      timestamp: parsed.timestamp,
    })

    const localFallbackEnabled = process.env.MEDIA_NODE_LOCAL_FALLBACK === '1'

    let output: Record<string, unknown>
    let runId: string | undefined

    try {
      const triggerResult = await triggerTaskAndPoll(
        'extract-frame',
        {
          videoUrl: parsed.videoUrl,
          timestamp: parsed.timestamp,
          runId: '__standalone__',
          nodeId: '__standalone__',
        },
        {
          label: 'Extract frame task',
          pollIntervalMs: 300,
          timeoutMs: 90_000,
          requestId,
        }
      )

      output = triggerResult.output
      runId = triggerResult.runId
      console.log(`[${routeLabel}] [${requestId}] trigger task completed`, {
        runId,
        durationMs: Date.now() - startedAt,
      })
    } catch (taskError: unknown) {
      const taskMessage = getErrorMessage(taskError)
      const shouldFallback =
        localFallbackEnabled &&
        process.env.NODE_ENV !== 'production' &&
        taskMessage.includes('queued and was never picked up')

      if (!shouldFallback) {
        throw taskError
      }

      console.warn(
        `[${routeLabel}] [${requestId}] Trigger worker unavailable, using local fallback runner`
      )

      const { runExtractFrame } = await import('@/lib/nodeRunners/extractFrame')
      const localResult = await runExtractFrame({
        videoUrl: parsed.videoUrl,
        timestamp: parsed.timestamp,
      })

      output = { url: localResult.url, timestamp: localResult.timestamp }
      console.log(`[${routeLabel}] [${requestId}] local fallback completed`, {
        durationMs: Date.now() - startedAt,
      })
    }

    const outputUrl = (output as { url?: string }).url
    if (!outputUrl) {
      return error('Extract frame task returned no URL', 500)
    }

    console.log(`[${routeLabel}] [${requestId}] success`, {
      outputUrl: summarizeUrl(outputUrl),
      runId: runId ?? null,
      durationMs: Date.now() - startedAt,
    })

    return success({ output: outputUrl, runId: runId ?? null, requestId })
  } catch (e: unknown) {
    const message = getErrorMessage(e)
    const status = getStatusFromMessage(message)
    console.error(`[${routeLabel}] [${requestId}] failed`, e)
    return error(`${message} (requestId: ${requestId})`, status)
  }
}

export const runtime = 'nodejs'
export const maxDuration = 120
