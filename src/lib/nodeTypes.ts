// ── Handle Types ──
export type HandleType = 'text' | 'image' | 'video'

// ── Output type per node ──
export const NODE_OUTPUT_TYPES: Record<string, HandleType> = {
  text: 'text',
  uploadImage: 'image',
  uploadVideo: 'video',
  llm: 'text',
  cropImage: 'image',
  extractFrame: 'image',
  kreaImage: 'image',
}

// ── What each input handle accepts ──
export const HANDLE_ACCEPT_TYPES: Record<string, HandleType> = {
  // LLM handles
  system_prompt: 'text',
  user_message: 'text',
  images: 'image',
  // Crop handles
  image_url: 'image',
  x_percent: 'text',
  y_percent: 'text',
  width_percent: 'text',
  height_percent: 'text',
  // Extract Frame handles
  video_url: 'video',
  timestamp: 'text',
  // KreaImage handles
  'image-prompt': 'image',
  'style-image': 'image',
  'prompt': 'text',
  'seed': 'text',
  // Generic fallbacks
  'text-input': 'text',
  'image-input': 'image',
  'video-input': 'video',
}

// ── Normalize node type strings ──
export const NODE_TYPE_NORMALIZATION: Record<string, string> = {
  'text-node': 'text',
  'upload-image': 'uploadImage',
  'upload-image-node': 'uploadImage',
  'upload-video': 'uploadVideo',
  'upload-video-node': 'uploadVideo',
  'llm-node': 'llm',
  'crop-image': 'cropImage',
  'crop-image-node': 'cropImage',
  'extract-frame': 'extractFrame',
  'extract-frame-node': 'extractFrame',
  'krea-image': 'kreaImage',
  'krea-image-node': 'kreaImage',
  image: 'kreaImage',
}

export function normalizeNodeType(nodeType: string | undefined | null): string {
  if (!nodeType) return 'text'
  return NODE_TYPE_NORMALIZATION[nodeType] || nodeType
}

/**
 * Check if a connection between two nodes is type-safe.
 */
export function isConnectionTypeValid(
  sourceNodeType: string,
  targetHandleId: string
): boolean {
  const sourceOutputType = NODE_OUTPUT_TYPES[sourceNodeType]
  const targetAcceptType = HANDLE_ACCEPT_TYPES[targetHandleId]

  if (!sourceOutputType || !targetAcceptType) return true // allow unknown
  return sourceOutputType === targetAcceptType
}
