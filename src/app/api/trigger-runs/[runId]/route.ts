import { NextRequest } from 'next/server'
import { runs } from '@trigger.dev/sdk/v3'
import { authenticateUser, success, error } from '@/lib/apiHelpers'

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  return 'Internal server error'
}

function getStatusFromMessage(message: string): number {
  const normalized = message.toLowerCase()
  if (normalized.includes('not found')) return 404
  if (normalized.includes('missing')) return 400
  return 500
}

type TriggerRunResponse = {
  id?: string
  status?: string
  attemptCount?: number
  isQueued?: boolean
  isExecuting?: boolean
  isWaiting?: boolean
  isCompleted?: boolean
  isFailed?: boolean
  isCancelled?: boolean
  error?: unknown
  output?: unknown
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const [, authError] = await authenticateUser()
    if (authError) return authError

    const { runId } = await params
    const run = (await runs.retrieve(runId)) as TriggerRunResponse

    return success({
      runId: run.id ?? runId,
      status: run.status ?? 'UNKNOWN',
      attemptCount: run.attemptCount ?? 0,
      isQueued: run.isQueued ?? false,
      isExecuting: run.isExecuting ?? false,
      isWaiting: run.isWaiting ?? false,
      isCompleted: run.isCompleted ?? false,
      isFailed: run.isFailed ?? false,
      isCancelled: run.isCancelled ?? false,
      output: run.output ?? null,
      error: run.error ?? null,
    })
  } catch (e: unknown) {
    const message = getErrorMessage(e)
    const status = getStatusFromMessage(message)
    return error(message, status)
  }
}

export const runtime = 'nodejs'
