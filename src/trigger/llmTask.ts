import { task } from '@trigger.dev/sdk/v3'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { prisma } from '@/lib/prisma'

const FINAL_GEMINI_FALLBACK_MODEL = 'gemini-2.0-flash-lite'

function remapGeminiModel(model?: string): { primary: string; fallback?: string } {
  const normalizedModel = model?.trim()

  if (!normalizedModel) {
    return { primary: FINAL_GEMINI_FALLBACK_MODEL }
  }

  if (normalizedModel === 'gemini-1.5-flash') {
    return { primary: FINAL_GEMINI_FALLBACK_MODEL }
  }

  if (normalizedModel === 'gemini-1.5-pro') {
    return { primary: 'gemini-1.5-pro-latest', fallback: 'gemini-2.0-flash' }
  }

  if (normalizedModel === 'gemini-2.0-flash') {
    return { primary: 'gemini-2.0-flash' }
  }

  return { primary: FINAL_GEMINI_FALLBACK_MODEL }
}

function isInvalidGeminiModelError(error: unknown): boolean {
  if (!error) {
    return false
  }

  const message =
    typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message?: unknown }).message || '')
      : String(error)

  const normalized = message.toLowerCase()
  return normalized.includes('model') && (
    normalized.includes('not found') ||
    normalized.includes('is not found') ||
    normalized.includes('invalid') ||
    normalized.includes('unsupported') ||
    normalized.includes('deprecated') ||
    normalized.includes('not available')
  )
}

interface LLMPayload {
  model?: string
  systemPrompt?: string
  userMessage: string
  imageUrls?: string[]
  runId: string
  nodeId: string
}

export const llmTask = task({
  id: 'llm-execution',
  maxDuration: 300,

  run: async (payload: LLMPayload) => {
    const { model, systemPrompt, userMessage, imageUrls, runId, nodeId } = payload

    if (runId !== '__standalone__') {
      await prisma.nodeResult.updateMany({
        where: { runId, nodeId },
        data: {
          status: 'RUNNING',
          startedAt: new Date(),
        },
      })
    }

    const startTime = Date.now()

    try {
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)
      const { primary: mappedModel, fallback: remappedFallbackModel } = remapGeminiModel(model)

      const parts: any[] = []

      if (imageUrls && imageUrls.length > 0) {
        for (const url of imageUrls) {
          try {
            const res = await fetch(url)
            const buffer = await res.arrayBuffer()
            const base64 = Buffer.from(buffer).toString('base64')
            const contentType = res.headers.get('content-type') || 'image/jpeg'

            parts.push({
              inlineData: {
                data: base64,
                mimeType: contentType,
              },
            })
          } catch (e) {
            console.error('Failed to fetch image:', url, e)
          }
        }
      }

      parts.push({ text: userMessage })

      const request: any = {
        contents: [{ role: 'user', parts }],
      }

      if (systemPrompt) {
        request.systemInstruction = {
          parts: [{ text: systemPrompt }],
        }
      }

      let result

      try {
        const geminiModel = genAI.getGenerativeModel({
          model: mappedModel,
        })
        result = await geminiModel.generateContent(request)
      } catch (modelError) {
        if (!remappedFallbackModel || !isInvalidGeminiModelError(modelError)) {
          throw modelError
        }

        const fallbackModel = genAI.getGenerativeModel({
          model: remappedFallbackModel,
        })
        result = await fallbackModel.generateContent(request)
      }

      const text = result.response.text()
      const duration = Date.now() - startTime

      if (runId !== '__standalone__') {
        await prisma.nodeResult.updateMany({
          where: { runId, nodeId },
          data: {
            status: 'SUCCESS',
            outputs: { text },
            completedAt: new Date(),
            duration,
          },
        })
      }

      return { text, duration }
    } catch (error: any) {
      const duration = Date.now() - startTime

      if (runId !== '__standalone__') {
        await prisma.nodeResult.updateMany({
          where: { runId, nodeId },
          data: {
            status: 'FAILED',
            error: error.message,
            completedAt: new Date(),
            duration,
          },
        })
      }

      throw error
    }
  },
})
