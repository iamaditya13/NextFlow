import { NextRequest } from 'next/server'
import { z } from 'zod'
import { authenticateUser, success, error, zodError } from '@/lib/apiHelpers'
import { triggerTask } from '@/lib/triggerTaskRunner'

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

    const { runId } = await triggerTask(
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
        requestId,
      }
    )

    console.log(`[${routeLabel}] [${requestId}] queued`, {
      runId,
      durationMs: Date.now() - startedAt,
    })

    return success({ runId, status: 'QUEUED', requestId }, 202)
  } catch (e: unknown) {
    const message = getErrorMessage(e)
    const status = getStatusFromMessage(message)
    console.error(`[${routeLabel}] [${requestId}] failed`, e)
    return error(`${message} (requestId: ${requestId})`, status)
  }
}

export const runtime = 'nodejs'
export const maxDuration = 120
