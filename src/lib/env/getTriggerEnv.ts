type TriggerEnvOptions = {
  allowMissing?: boolean
}

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
