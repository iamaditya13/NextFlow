import { NextRequest } from 'next/server'
import { tasks, runs } from '@trigger.dev/sdk/v3'
import { z } from 'zod'
import { authenticateUser, success, error, zodError } from '@/lib/apiHelpers'

const schema = z.object({
  model: z.string(),
  systemPrompt: z.string().optional(),
  userMessage: z.string().min(1),
  imageUrls: z.array(z.string()).optional(),
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

    const handle = await tasks.trigger('llm-execution', {
      model: parsed.model,
      systemPrompt: parsed.systemPrompt,
      userMessage: parsed.userMessage,
      imageUrls: parsed.imageUrls || [],
      runId: '__standalone__',
      nodeId: '__standalone__',
    })

    const result = await withTimeout(
      runs.poll(handle.id, { pollIntervalMs: 500 }),
      90_000,
      'LLM task'
    )

    if (!result.output) {
      return error('LLM task produced no output', 500)
    }

    const outputText = (result.output as { text?: string }).text
    if (outputText === undefined || outputText === null) {
      return error('LLM task returned no text', 500)
    }

    return success({ output: outputText })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal server error'
    return error(message, 500)
  }
}

export const runtime = 'nodejs'
export const maxDuration = 120
