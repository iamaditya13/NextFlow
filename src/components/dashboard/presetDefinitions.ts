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

// ── Product Marketing Kit Generator ──────────────────────────────────────────
//
// Canonical sample workflow demonstrating all 6 node types, two independent
// parallel branches (A and B), and a convergence (fan-in) node C1 that waits
// for BOTH branches before running.
//
// Branch A:  Upload Image → Crop Image → LLM #1 (product description)
//            Text (system prompt) ──────────────────↑
//            Text (product details) ────────────────↑
//
// Branch B:  Upload Video → Extract Frame
//
// Fan-in C1: LLM #2 — receives A5 output + A2 cropped image + B2 frame
//            Text (social media prompt) ────────────↑

const PRODUCT_MARKETING_KIT: PresetWorkflow = {
  nodes: [
    // ── Branch A ─────────────────────────────────────────────────────────────
    {
      id: 'pmk-a1',
      type: 'uploadImage',
      position: { x: 80, y: 80 },
      data: { label: 'Upload Product Image' },
    },
    {
      id: 'pmk-a2',
      type: 'cropImage',
      position: { x: 460, y: 80 },
      data: {
        label: 'Crop Image',
        xPercent: 10,
        yPercent: 10,
        widthPercent: 80,
        heightPercent: 80,
      },
    },
    {
      id: 'pmk-a3',
      type: 'text',
      position: { x: 460, y: 460 },
      data: {
        label: 'System Prompt',
        text: 'You are a professional marketing copywriter. Generate a compelling one-paragraph product description.',
      },
    },
    {
      id: 'pmk-a4',
      type: 'text',
      position: { x: 460, y: 660 },
      data: {
        label: 'Product Details',
        text: 'Product: Wireless Bluetooth Headphones. Features: Noise cancellation, 30-hour battery, foldable design.',
      },
    },
    {
      id: 'pmk-a5',
      type: 'llm',
      position: { x: 860, y: 120 },
      data: {
        label: 'Generate Product Description',
        model: 'gemini-2.0-flash',
      },
    },
    // ── Branch B ─────────────────────────────────────────────────────────────
    {
      id: 'pmk-b1',
      type: 'uploadVideo',
      position: { x: 80, y: 920 },
      data: { label: 'Upload Product Video' },
    },
    {
      id: 'pmk-b2',
      type: 'extractFrame',
      position: { x: 460, y: 920 },
      data: {
        label: 'Extract Frame from Video',
        timestamp: '50%',
      },
    },
    // ── Convergence ───────────────────────────────────────────────────────────
    {
      id: 'pmk-c0',
      type: 'text',
      position: { x: 860, y: 760 },
      data: {
        label: 'Social Media Prompt',
        text: 'You are a social media manager. Create a tweet-length marketing post based on the product description and visual assets.',
      },
    },
    {
      id: 'pmk-c1',
      type: 'llm',
      position: { x: 1260, y: 440 },
      data: {
        label: 'Generate Marketing Post',
        model: 'gemini-2.0-flash',
      },
    },
  ],
  edges: [
    // Branch A
    {
      id: 'pmk-e1',
      source: 'pmk-a1',
      sourceHandle: 'output',
      target: 'pmk-a2',
      targetHandle: 'image_url',
      animated: true,
      style: { stroke: '#3B82F6', strokeWidth: 2 },
    },
    {
      id: 'pmk-e2',
      source: 'pmk-a2',
      sourceHandle: 'output',
      target: 'pmk-a5',
      targetHandle: 'images',
      animated: true,
      style: { stroke: '#A855F7', strokeWidth: 2 },
    },
    {
      id: 'pmk-e3',
      source: 'pmk-a3',
      sourceHandle: 'output',
      target: 'pmk-a5',
      targetHandle: 'system_prompt',
      animated: true,
      style: { stroke: '#F97316', strokeWidth: 2 },
    },
    {
      id: 'pmk-e4',
      source: 'pmk-a4',
      sourceHandle: 'output',
      target: 'pmk-a5',
      targetHandle: 'user_message',
      animated: true,
      style: { stroke: '#F97316', strokeWidth: 2 },
    },
    // Branch B
    {
      id: 'pmk-e5',
      source: 'pmk-b1',
      sourceHandle: 'output',
      target: 'pmk-b2',
      targetHandle: 'video_url',
      animated: true,
      style: { stroke: '#22C55E', strokeWidth: 2 },
    },
    // Convergence: both branches → C1
    {
      id: 'pmk-e6',
      source: 'pmk-a5',
      sourceHandle: 'output',
      target: 'pmk-c1',
      targetHandle: 'user_message',
      animated: true,
      style: { stroke: '#EAB308', strokeWidth: 2 },
    },
    {
      id: 'pmk-e7',
      source: 'pmk-a2',
      sourceHandle: 'output',
      target: 'pmk-c1',
      targetHandle: 'images',
      animated: true,
      style: { stroke: '#A855F7', strokeWidth: 2 },
    },
    {
      id: 'pmk-e8',
      source: 'pmk-b2',
      sourceHandle: 'output',
      target: 'pmk-c1',
      targetHandle: 'images',
      animated: true,
      style: { stroke: '#EC4899', strokeWidth: 2 },
    },
    {
      id: 'pmk-e9',
      source: 'pmk-c0',
      sourceHandle: 'output',
      target: 'pmk-c1',
      targetHandle: 'system_prompt',
      animated: true,
      style: { stroke: '#F97316', strokeWidth: 2 },
    },
  ],
}

export const PRESET_WORKFLOWS: Record<string, PresetWorkflow> = {
  'Image Generator': IMAGE_GENERATOR,
  'Video Generator': VIDEO_GENERATOR,
  '8K Upscaling & Enhancer': UPSCALING_8K,
  'LLM Image Captioning': LLM_IMAGE_CAPTIONING,
  'Prompt to Workflow': PROMPT_TO_WORKFLOW,
  'Product Marketing Kit Generator': PRODUCT_MARKETING_KIT,
}
