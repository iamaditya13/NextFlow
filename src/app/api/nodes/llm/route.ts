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

export async function POST(req: NextRequest) {
  try {
    const [user, authError] = await authenticateUser()
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
      // No runId/nodeId for standalone execution — task handles missing gracefully
      runId: '__standalone__',
      nodeId: '__standalone__',
    })

    // Poll for result
    const result = await runs.poll(handle.id, { pollIntervalMs: 1000 })

    if (!result.output) {
      return error('LLM task produced no output', 500)
    }

    return success({
      output: (result.output as { text?: string }).text ?? result.output,
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal server error'
    return error(message, 500)
  }
}

export const runtime = 'nodejs'
