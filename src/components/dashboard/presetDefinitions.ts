import type { Node, Edge } from '@xyflow/react'

const EDGE_STYLE = {
  animated: true,
  style: { stroke: '#EAB308', strokeWidth: 2 },
}

export type PresetId =
  | 'image-generator'
  | 'video-generator'
  | '8k-upscaling'
  | 'llm-image-captioning'
  | 'prompt-to-workflow'
  | 'empty'

export interface PresetWorkflow {
  nodes: Node[]
  edges: Edge[]
}

const IMAGE_GENERATOR: PresetWorkflow = {
  nodes: [
    {
      id: 'p1-text',
      type: 'text',
      position: { x: 80, y: 200 },
      data: { label: 'Prompt', text: 'A serene landscape with mountains' },
    },
    {
      id: 'p1-image',
      type: 'kreaImage',
      position: { x: 440, y: 140 },
      data: { label: 'Image Generator', model: 'krea-1', prompt: '', aspectRatio: '1:1', resolution: '1K' },
    },
  ],
  edges: [
    {
      id: 'p1-e1',
      source: 'p1-text',
      sourceHandle: 'output',
      target: 'p1-image',
      targetHandle: 'prompt',
      ...EDGE_STYLE,
    },
  ],
}

const VIDEO_GENERATOR: PresetWorkflow = {
  nodes: [
    {
      id: 'p2-text',
      type: 'text',
      position: { x: 80, y: 200 },
      data: { label: 'Prompt', text: 'A cinematic shot of waves crashing on a beach' },
    },
    {
      id: 'p2-video',
      type: 'kreaImage',
      position: { x: 440, y: 140 },
      data: { label: 'Video Generator', model: 'wan-2.1', prompt: '', aspectRatio: '16:9', resolution: '1K' },
    },
  ],
  edges: [
    {
      id: 'p2-e1',
      source: 'p2-text',
      sourceHandle: 'output',
      target: 'p2-video',
      targetHandle: 'prompt',
      ...EDGE_STYLE,
    },
  ],
}

const UPSCALING_8K: PresetWorkflow = {
  nodes: [
    {
      id: 'p3-upload',
      type: 'uploadImage',
      position: { x: 80, y: 200 },
      data: { label: 'Upload Image' },
    },
    {
      id: 'p3-crop',
      type: 'cropImage',
      position: { x: 440, y: 140 },
      data: { label: '8K Upscaler', xPercent: 0, yPercent: 0, widthPercent: 100, heightPercent: 100, upscale: '8K' },
    },
  ],
  edges: [
    {
      id: 'p3-e1',
      source: 'p3-upload',
      sourceHandle: 'output',
      target: 'p3-crop',
      targetHandle: 'image_url',
      ...EDGE_STYLE,
    },
  ],
}

const LLM_IMAGE_CAPTIONING: PresetWorkflow = {
  nodes: [
    {
      id: 'p4-upload',
      type: 'uploadImage',
      position: { x: 80, y: 80 },
      data: { label: 'Upload Image' },
    },
    {
      id: 'p4-text',
      type: 'text',
      position: { x: 80, y: 360 },
      data: {
        label: 'System Prompt',
        text: 'Describe this image in detail and generate a creative prompt.',
      },
    },
    {
      id: 'p4-llm',
      type: 'llm',
      position: { x: 480, y: 200 },
      data: { label: 'GPT-5 Vision', model: 'gemini-2.0-flash' },
    },
  ],
  edges: [
    {
      id: 'p4-e1',
      source: 'p4-upload',
      sourceHandle: 'output',
      target: 'p4-llm',
      targetHandle: 'images',
      ...EDGE_STYLE,
    },
    {
      id: 'p4-e2',
      source: 'p4-text',
      sourceHandle: 'output',
      target: 'p4-llm',
      targetHandle: 'system_prompt',
      ...EDGE_STYLE,
    },
  ],
}

const PROMPT_TO_WORKFLOW: PresetWorkflow = {
  nodes: [
    {
      id: 'p5-text',
      type: 'text',
      position: { x: 80, y: 200 },
      data: {
        label: 'Prompt',
        text: 'Create a workflow that generates marketing copy for a product',
      },
    },
    {
      id: 'p5-llm',
      type: 'llm',
      position: { x: 440, y: 140 },
      data: { label: 'Workflow Generator', model: 'gemini-2.0-flash' },
    },
  ],
  edges: [
    {
      id: 'p5-e1',
      source: 'p5-text',
      sourceHandle: 'output',
      target: 'p5-llm',
      targetHandle: 'user_message',
      ...EDGE_STYLE,
    },
  ],
}

export const PRESET_WORKFLOWS: Record<string, PresetWorkflow> = {
  'Image Generator': IMAGE_GENERATOR,
  'Video Generator': VIDEO_GENERATOR,
  '8K Upscaling & Enhancer': UPSCALING_8K,
  'LLM Image Captioning': LLM_IMAGE_CAPTIONING,
  'Prompt to Workflow': PROMPT_TO_WORKFLOW,
}
