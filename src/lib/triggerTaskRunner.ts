import { runs, tasks } from '@trigger.dev/sdk/v3'

interface TriggerTaskOptions {
  label: string
  pollIntervalMs?: number
  timeoutMs?: number
  maxTriggerAttempts?: number
  retryDelayMs?: number
  requestId?: string
}

interface TriggerResult {
  runId: string
  output: Record<string, unknown>
  status: string
  attemptCount: number
}

type TriggerRunSnapshot = {
  status?: string
  attemptCount?: number
  isQueued?: boolean
  isExecuting?: boolean
  isWaiting?: boolean
  updatedAt?: string | Date
  error?: unknown
}

const RETRYABLE_ERROR_PATTERNS = [
  'etimedout',
  'econnreset',
  'econnrefused',
  'socket hang up',
  'rate limit',
  '429',
  '503',
]

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: NodeJS.Timeout | undefined
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`${label} timed out after ${ms / 1000}s`))
        }, ms)
      }),
    ])
  } finally {
    if (timer) {
      clearTimeout(timer)
    }
  }
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    return err.message
  }
  if (typeof err === 'string') return err
  return 'Unknown Trigger task error'
}

function isQueueTimeout(message: string, label: string): boolean {
  return message.includes(`${label} timed out after`)
}

function isRetryableTriggerError(err: unknown): boolean {
  const message = errorMessage(err).toLowerCase()
  return RETRYABLE_ERROR_PATTERNS.some((pattern) => message.includes(pattern))
}

function assertTriggerEnv(): void {
  const missing: string[] = []
  if (!process.env.TRIGGER_SECRET_KEY) missing.push('TRIGGER_SECRET_KEY')
  if (!process.env.TRIGGER_PROJECT_ID) missing.push('TRIGGER_PROJECT_ID')

  if (missing.length > 0) {
    throw new Error(
      `Missing Trigger.dev env var(s): ${missing.join(
        ', '
      )}. Add them to .env.local (for local) and your deployment environment (for production).`
    )
  }
}

function prefix(label: string, requestId?: string): string {
  const normalized = label.replace(/\s+/g, '-').toLowerCase()
  if (requestId) {
    return `[trigger:${normalized}] [${requestId}]`
  }
  return `[trigger:${normalized}]`
}

function summarizeSnapshot(snapshot: TriggerRunSnapshot | null): string {
  if (!snapshot) return 'No run snapshot available'
  return [
    `status=${snapshot.status ?? 'unknown'}`,
    `attemptCount=${snapshot.attemptCount ?? 0}`,
    `isQueued=${snapshot.isQueued ?? false}`,
    `isExecuting=${snapshot.isExecuting ?? false}`,
    `isWaiting=${snapshot.isWaiting ?? false}`,
    `updatedAt=${snapshot.updatedAt ? String(snapshot.updatedAt) : 'unknown'}`,
  ].join(', ')
}

async function getRunSnapshot(runId: string): Promise<TriggerRunSnapshot | null> {
  try {
    const snapshot = await runs.retrieve(runId)
    return snapshot as TriggerRunSnapshot
  } catch {
    return null
  }
}

export async function triggerTaskAndPoll(
  taskId: string,
  payload: Record<string, unknown>,
  options: TriggerTaskOptions
): Promise<TriggerResult> {
  const {
    label,
    pollIntervalMs = 500,
    timeoutMs = 90_000,
    maxTriggerAttempts = 2,
    retryDelayMs = 1200,
    requestId,
  } = options

  assertTriggerEnv()

  const logPrefix = prefix(label, requestId)
  console.log(`${logPrefix} dispatch`, {
    taskId,
    payloadKeys: Object.keys(payload),
    timeoutMs,
    pollIntervalMs,
    maxTriggerAttempts,
  })

  let handle: { id: string } | null = null
  let lastDispatchError: unknown

  for (let attempt = 1; attempt <= maxTriggerAttempts; attempt++) {
    try {
      handle = await tasks.trigger(taskId, payload)
      console.log(`${logPrefix} queued`, { runId: handle.id, dispatchAttempt: attempt })
      break
    } catch (err: unknown) {
      lastDispatchError = err
      const retryable = attempt < maxTriggerAttempts && isRetryableTriggerError(err)
      console.error(`${logPrefix} dispatch failed`, {
        dispatchAttempt: attempt,
        retryable,
        error: errorMessage(err),
      })

      if (!retryable) {
        break
      }

      await sleep(retryDelayMs * attempt)
    }
  }

  if (!handle) {
    throw new Error(
      `${label} could not be queued in Trigger.dev: ${errorMessage(lastDispatchError)}`
    )
  }

  try {
    const result = await withTimeout(runs.poll(handle.id, { pollIntervalMs }), timeoutMs, label)
    const runResult = result as {
      status: string
      attemptCount?: number
      error?: unknown
      output?: unknown
    }

    if (runResult.error) {
      throw new Error(errorMessage(runResult.error))
    }

    if (runResult.status !== 'COMPLETED') {
      throw new Error(`${label} finished with status ${runResult.status}`)
    }

    if (!runResult.output || typeof runResult.output !== 'object') {
      throw new Error(`${label} produced no output`)
    }

    console.log(`${logPrefix} completed`, {
      runId: handle.id,
      status: runResult.status,
      attemptCount: runResult.attemptCount ?? 0,
    })

    return {
      runId: handle.id,
      output: runResult.output as Record<string, unknown>,
      status: runResult.status,
      attemptCount: runResult.attemptCount ?? 0,
    }
  } catch (err: unknown) {
    const message = errorMessage(err)
    const snapshot = await getRunSnapshot(handle.id)
    const snapshotSummary = summarizeSnapshot(snapshot)

    if (isQueueTimeout(message, label) && snapshot?.isQueued && (snapshot.attemptCount ?? 0) === 0) {
      throw new Error(
        `${label} is queued and was never picked up by a Trigger.dev worker. Start a worker for this environment (local: \`npm run trigger:dev\`) and deploy workers for production. ${snapshotSummary}`
      )
    }

    console.error(`${logPrefix} failed`, {
      runId: handle.id,
      error: message,
      snapshot: snapshotSummary,
    })

    throw new Error(`${label} failed (runId: ${handle.id}). ${message}. ${snapshotSummary}`)
  }
}
