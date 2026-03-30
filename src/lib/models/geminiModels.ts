export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash' as const
export const FALLBACK_GEMINI_MODEL = 'gemini-flash-latest' as const

export type GeminiModelOption = {
  value: string
  label: string
}

export const GEMINI_MODEL_OPTIONS: GeminiModelOption[] = [
  { value: DEFAULT_GEMINI_MODEL, label: 'Gemini 2.5 Flash' },
  { value: FALLBACK_GEMINI_MODEL, label: 'Gemini Flash (Latest)' },
  { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
]

const LEGACY_MODEL_REMAP: Record<string, string> = {
  'gemini-1.5-flash': DEFAULT_GEMINI_MODEL,
  'gemini-1.5-pro': DEFAULT_GEMINI_MODEL,
  'gemini-1.5-pro-latest': DEFAULT_GEMINI_MODEL,
  'gemini-2.0-flash': DEFAULT_GEMINI_MODEL,
  'gemini-2.0-flash-lite': DEFAULT_GEMINI_MODEL,
  'gemini-pro': DEFAULT_GEMINI_MODEL,
}

export function normalizeGeminiModel(model?: string): string {
  const normalized = model?.trim().toLowerCase()
  if (!normalized) return DEFAULT_GEMINI_MODEL
  return LEGACY_MODEL_REMAP[normalized] ?? normalized
}
