type TriggerEnvOptions = {
  allowMissing?: boolean
}

type GeminiEnvKey = 'GOOGLE_AI_API_KEY' | 'GEMINI_API_KEY' | 'GOOGLE_API_KEY'

function getRequiredEnvValue(
  key: 'TRIGGER_PROJECT_ID' | 'TRIGGER_SECRET_KEY' | 'TRIGGER_API_URL',
  options?: TriggerEnvOptions
): string {
  const value = process.env[key]
  if (value) {
    return value
  }

  if (options?.allowMissing) {
    return ''
  }

  throw new Error(`Missing ${key}`)
}

function isPlaceholderApiKey(value: string): boolean {
  const normalized = value.trim()
  const upper = normalized.toUpperCase()
  return (
    normalized.length === 0 ||
    upper === 'YOUR_API_KEY' ||
    upper === 'YOUR_GOOGLE_API_KEY' ||
    upper.includes('TODO') ||
    upper.includes('PLACEHOLDER') ||
    normalized === '***'
  )
}

const GEMINI_ENV_KEYS: GeminiEnvKey[] = [
  'GOOGLE_AI_API_KEY',
  'GEMINI_API_KEY',
  'GOOGLE_API_KEY',
]

export function getGeminiApiKey(options?: TriggerEnvOptions): string {
  for (const key of GEMINI_ENV_KEYS) {
    const value = process.env[key]
    if (!value) continue

    if (isPlaceholderApiKey(value)) {
      throw new Error(
        `Invalid ${key}: placeholder value detected. Set a real Gemini API key in your environment.`
      )
    }

    return value
  }

  if (options?.allowMissing) {
    return ''
  }

  throw new Error(
    `Missing Gemini API key. Set one of: ${GEMINI_ENV_KEYS.join(', ')}.`
  )
}

export function getTriggerProjectId(options?: TriggerEnvOptions): string {
  return getRequiredEnvValue('TRIGGER_PROJECT_ID', options)
}

export function getTriggerSecretKey(options?: TriggerEnvOptions): string {
  return getRequiredEnvValue('TRIGGER_SECRET_KEY', options)
}

export function getTriggerApiUrl(options?: TriggerEnvOptions): string {
  const value = getRequiredEnvValue('TRIGGER_API_URL', { allowMissing: true, ...options })
  if (value) {
    return value
  }
  return 'https://api.trigger.dev'
}

export function getTriggerEnv(options?: TriggerEnvOptions): {
  projectId: string
  secretKey: string
  apiUrl: string
} {
  return {
    projectId: getTriggerProjectId(options),
    secretKey: getTriggerSecretKey(options),
    apiUrl: getTriggerApiUrl(options),
  }
}
