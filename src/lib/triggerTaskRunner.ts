import { runs, tasks } from '@trigger.dev/sdk/v3'

interface TriggerTaskOptions {
  label: string
  pollIntervalMs?: number
  timeoutMs?: number
}

interface TriggerResult {
  runId: string
  output: Record<string, unknown>
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms)
    ),
  ])
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  return 'Unknown Trigger task error'
}

function isQueueTimeout(message: string, label: string): boolean {
  return message.includes(`${label} timed out after`)
}

export async function triggerTaskAndPoll(
  taskId: string,
  payload: Record<string, unknown>,
  options: TriggerTaskOptions
): Promise<TriggerResult> {
  const { label, pollIntervalMs = 500, timeoutMs = 90_000 } = options

  const handle = await tasks.trigger(taskId, payload)

  try {
    const result = await withTimeout(
      runs.poll(handle.id, { pollIntervalMs }),
      timeoutMs,
      label
    )

    if ((result as { error?: unknown }).error) {
      throw new Error(errorMessage((result as { error?: unknown }).error))
    }

    if (!result.output) {
      throw new Error(`${label} produced no output`)
    }

    return { runId: handle.id, output: result.output as Record<string, unknown> }
  } catch (err: unknown) {
    const message = errorMessage(err)

    if (isQueueTimeout(message, label)) {
      try {
        const snapshot = await runs.retrieve(handle.id)
        if (snapshot.status === 'QUEUED' && (snapshot.attemptCount ?? 0) === 0) {
          throw new Error(
            `${label} is queued and was never picked up by a Trigger.dev worker. Start a worker for this environment (for local: \`npx trigger.dev@latest dev\`).`
          )
        }

        throw new Error(
          `${label} timed out. Last Trigger status: ${snapshot.status} (attempts: ${snapshot.attemptCount ?? 0}).`
        )
      } catch (snapshotErr: unknown) {
        if (snapshotErr instanceof Error) {
          throw snapshotErr
        }
      }
    }

    throw err
  }
}

