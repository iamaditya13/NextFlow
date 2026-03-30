import { task } from '@trigger.dev/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { GenerateContentRequest } from '@google/generative-ai'
import { prisma } from '@/lib/prisma'
import { getGeminiApiKey } from '@/lib/env/getTriggerEnv'

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash'
const DEFAULT_GEMINI_FALLBACK_MODEL = 'gemini-flash-latest'

const LEGACY_MODEL_REMAP: Record<string, string> = {
  'gemini-1.5-flash': DEFAULT_GEMINI_MODEL,
  'gemini-1.5-pro': DEFAULT_GEMINI_MODEL,
  'gemini-1.5-pro-latest': DEFAULT_GEMINI_MODEL,
  'gemini-2.0-flash': DEFAULT_GEMINI_MODEL,
  'gemini-2.0-flash-lite': DEFAULT_GEMINI_MODEL,
  'gemini-pro': DEFAULT_GEMINI_MODEL,
}

function remapGeminiModel(model?: string): { primary: string; fallback?: string } {
  const normalizedModel = model?.trim().toLowerCase()

  if (!normalizedModel) {
    return { primary: DEFAULT_GEMINI_MODEL, fallback: DEFAULT_GEMINI_FALLBACK_MODEL }
  }

  const remapped = LEGACY_MODEL_REMAP[normalizedModel]
  if (remapped) {
    return { primary: remapped, fallback: DEFAULT_GEMINI_FALLBACK_MODEL }
  }

  if (
    normalizedModel === DEFAULT_GEMINI_MODEL ||
    normalizedModel === DEFAULT_GEMINI_FALLBACK_MODEL
  ) {
    return { primary: normalizedModel, fallback: DEFAULT_GEMINI_FALLBACK_MODEL }
  }

  return { primary: normalizedModel, fallback: DEFAULT_GEMINI_FALLBACK_MODEL }
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

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message
  }
  return String(error)
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
      const apiKey = getGeminiApiKey()
      const genAI = new GoogleGenerativeAI(apiKey)
      const { primary: mappedModel, fallback: remappedFallbackModel } = remapGeminiModel(model)
      let resolvedModel = mappedModel

      const parts: Array<
        { inlineData: { data: string; mimeType: string } } | { text: string }
      > = []

      if (imageUrls && imageUrls.length > 0) {
        for (const url of imageUrls) {
          try {
            const res = await fetch(url)
            if (!res.ok) {
              throw new Error(`Failed to fetch image (${res.status} ${res.statusText})`)
            }
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

      const request: GenerateContentRequest = {
        contents: [{ role: 'user', parts }],
      }

      if (systemPrompt) {
        request.systemInstruction = {
          role: 'system',
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
        resolvedModel = remappedFallbackModel
      }

      const text = result.response.text().trim()
      if (!text) {
        throw new Error(`Gemini returned an empty response for model "${resolvedModel}"`)
      }
      const duration = Date.now() - startTime

      if (runId !== '__standalone__') {
        await prisma.nodeResult.updateMany({
          where: { runId, nodeId },
          data: {
            status: 'SUCCESS',
            outputs: { text, model: resolvedModel },
            completedAt: new Date(),
            duration,
          },
        })
      }

      return { text, duration, model: resolvedModel }
    } catch (error: unknown) {
      const duration = Date.now() - startTime
      const message = getErrorMessage(error)

      if (runId !== '__standalone__') {
        await prisma.nodeResult.updateMany({
          where: { runId, nodeId },
          data: {
            status: 'FAILED',
            error: message,
            completedAt: new Date(),
            duration,
          },
        })
      }

      throw error instanceof Error ? error : new Error(message)
    }
  },
})
