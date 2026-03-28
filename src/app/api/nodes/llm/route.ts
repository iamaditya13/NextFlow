import { NextRequest } from 'next/server'
import { z } from 'zod'
import { authenticateUser, success, error, zodError } from '@/lib/apiHelpers'
import { triggerTaskAndPoll } from '@/lib/triggerTaskRunner'

const schema = z.object({
  model: z.string(),
  systemPrompt: z.string().optional(),
  userMessage: z.string().min(1),
  imageUrls: z.array(z.string()).optional(),
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
      'llm-execution',
      {
        model: parsed.model,
        systemPrompt: parsed.systemPrompt,
        userMessage: parsed.userMessage,
        imageUrls: parsed.imageUrls || [],
        runId: '__standalone__',
        nodeId: '__standalone__',
      },
      { label: 'LLM task', pollIntervalMs: 500, timeoutMs: 90_000 }
    )

    const outputText = (output as { text?: string }).text
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
