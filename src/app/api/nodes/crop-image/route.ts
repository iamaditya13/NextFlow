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

const schema = z.object({
  imageUrl: httpUrlSchema,
  xPercent: z.number().min(0).max(100).default(0),
  yPercent: z.number().min(0).max(100).default(0),
  widthPercent: z.number().min(1).max(100).default(100),
  heightPercent: z.number().min(1).max(100).default(100),
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
  const routeLabel = 'POST /api/nodes/crop-image'

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
      imageUrl: summarizeUrl(parsed.imageUrl),
      xPercent: parsed.xPercent,
      yPercent: parsed.yPercent,
      widthPercent: parsed.widthPercent,
      heightPercent: parsed.heightPercent,
    })

    const localFallbackEnabled = process.env.MEDIA_NODE_LOCAL_FALLBACK === '1'

    let output: Record<string, unknown>
    let runId: string | undefined

    try {
      const triggerResult = await triggerTaskAndPoll(
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
        {
          label: 'Crop image task',
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

      const { runCropImage } = await import('@/lib/nodeRunners/cropImage')
      const localResult = await runCropImage({
        imageUrl: parsed.imageUrl,
        xPercent: parsed.xPercent,
        yPercent: parsed.yPercent,
        widthPercent: parsed.widthPercent,
        heightPercent: parsed.heightPercent,
      })

      output = { url: localResult.url }
      console.log(`[${routeLabel}] [${requestId}] local fallback completed`, {
        durationMs: Date.now() - startedAt,
      })
    }

    const outputUrl = (output as { url?: string }).url
    if (!outputUrl) {
      return error('Crop image task returned no URL', 500)
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
