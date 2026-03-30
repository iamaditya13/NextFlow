import { config as loadEnv } from 'dotenv'
import { runs, tasks } from '@trigger.dev/sdk/v3'

loadEnv({ path: '.env.local' })
loadEnv()

const requiredEnv = ['TRIGGER_SECRET_KEY', 'TRIGGER_PROJECT_ID']
const missingEnv = requiredEnv.filter((name) => !process.env[name])
if (missingEnv.length > 0) {
  console.error(
    `[test:media:nodes] Missing required env var(s): ${missingEnv.join(', ')}.\n` +
      'Set them in .env.local before running this script.'
  )
  process.exit(1)
}

const SAMPLE_IMAGE_URL =
  process.env.TEST_IMAGE_URL ||
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1200&q=80'
const SAMPLE_VIDEO_URL =
  process.env.TEST_VIDEO_URL ||
  'https://samplelib.com/lib/preview/mp4/sample-5s.mp4'

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function parseErrorMessage(error) {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return JSON.stringify(error)
}

async function triggerAndWatch(taskId, payload, options = {}) {
  const { label = taskId, timeoutMs = 120_000, pollIntervalMs = 1_000 } = options
  const startedAt = Date.now()

  console.log(`[test:media:nodes] triggering ${label}`, {
    taskId,
    payloadKeys: Object.keys(payload),
  })

  const handle = await tasks.trigger(taskId, payload)
  console.log(`[test:media:nodes] ${label} queued`, { runId: handle.id })

  let lastStatus = ''
  while (Date.now() - startedAt < timeoutMs) {
    const run = await runs.retrieve(handle.id)
    if (run.status !== lastStatus) {
      lastStatus = run.status
      console.log(`[test:media:nodes] ${label} status`, {
        runId: handle.id,
        status: run.status,
        attemptCount: run.attemptCount ?? 0,
        isQueued: run.isQueued,
        isExecuting: run.isExecuting,
      })
    }

    if (run.isCompleted) {
      if (run.error) {
        throw new Error(
          `${label} failed (${run.status}): ${
            typeof run.error === 'object' && run.error && 'message' in run.error
              ? run.error.message
              : parseErrorMessage(run.error)
          }`
        )
      }

      console.log(`[test:media:nodes] ${label} completed`, {
        runId: handle.id,
        durationMs: Date.now() - startedAt,
      })

      return run.output ?? {}
    }

    if (run.isFailed || run.isCancelled) {
      throw new Error(`${label} ended unsuccessfully with status ${run.status}`)
    }

    await sleep(pollIntervalMs)
  }

  throw new Error(`${label} timed out after ${timeoutMs / 1000}s`)
}

async function main() {
  console.log('[test:media:nodes] starting integration test')
  console.log('[test:media:nodes] sample inputs', {
    image: SAMPLE_IMAGE_URL,
    video: SAMPLE_VIDEO_URL,
  })

  const cropOutput = await triggerAndWatch(
    'crop-image',
    {
      imageUrl: SAMPLE_IMAGE_URL,
      xPercent: 5,
      yPercent: 5,
      widthPercent: 90,
      heightPercent: 90,
      runId: '__standalone__',
      nodeId: '__standalone__',
    },
    { label: 'crop-image task' }
  )

  const extractOutput = await triggerAndWatch(
    'extract-frame',
    {
      videoUrl: SAMPLE_VIDEO_URL,
      timestamp: '50%',
      runId: '__standalone__',
      nodeId: '__standalone__',
    },
    { label: 'extract-frame task' }
  )

  console.log('[test:media:nodes] media outputs', {
    cropUrl: cropOutput?.url,
    frameUrl: extractOutput?.url,
  })

  if (process.env.GOOGLE_AI_API_KEY) {
    const llmOutput = await triggerAndWatch(
      'llm-execution',
      {
        model: process.env.TEST_GEMINI_MODEL || 'gemini-2.0-flash',
        userMessage:
          'Describe the key visual differences between the two images in 2 concise bullet points.',
        imageUrls: [cropOutput?.url, extractOutput?.url].filter(Boolean),
        runId: '__standalone__',
        nodeId: '__standalone__',
      },
      { label: 'llm-execution task', timeoutMs: 180_000 }
    )

    console.log('[test:media:nodes] llm output preview', {
      text:
        typeof llmOutput?.text === 'string'
          ? llmOutput.text.slice(0, 400)
          : '<non-string output>',
    })
  } else {
    console.warn('[test:media:nodes] skipping llm-execution (GOOGLE_AI_API_KEY missing)')
  }

  console.log('[test:media:nodes] completed successfully')
}

main().catch((error) => {
  console.error('[test:media:nodes] failed', error)
  process.exit(1)
})
