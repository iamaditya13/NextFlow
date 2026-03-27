export type WorkflowTemplate = {
  id: string
  title: string
  subtitle?: string
  isPro?: boolean
  opacity?: number
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'empty-workflow',
    title: 'Empty Workflow',
  },
  {
    id: 'image-generator',
    title: 'Image Generator',
    subtitle: 'Simple text to image Generation with Krea 1',
  },
  {
    id: 'video-generator',
    title: 'Video Generator',
    subtitle: 'Simple Video Generation with Wan 2.1',
  },
  {
    id: '8k-upscaling-enhancer',
    title: '8K Upscaling & Enhancer',
    subtitle: 'Upscaling a low resolution image to 8K',
  },
  {
    id: 'llm-image-captioning',
    title: 'LLM Image Captioning',
    subtitle: 'Generate a prompt from an image with GPT-5',
    isPro: true,
    opacity: 0.5,
  },
  {
    id: 'prompt-to-workflow',
    title: 'Prompt to Workflow',
    subtitle: 'Generate a workflow from a prompt.',
  },
]

export const getTemplateHref = (template: WorkflowTemplate) => {
  if (template.id === 'empty-workflow') {
    return '/nodes/new'
  }

  return `/nodes/${template.id}?new=1`
}
