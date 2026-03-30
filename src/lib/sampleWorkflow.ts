import { prisma } from '@/lib/prisma'
import { DEFAULT_GEMINI_MODEL } from '@/lib/models/geminiModels'

export async function initializeSampleWorkflow(userId: string) {
  const existing = await prisma.workflow.findFirst({
    where: {
      userId,
      name: 'Product Marketing Kit Generator',
    },
  })

  if (existing) return existing

  return prisma.workflow.create({
    data: {
      name: 'Product Marketing Kit Generator',
      userId,
      data: {
        nodes: [
          {
            id: 'node-1',
            type: 'uploadImage',
            position: { x: 100, y: 100 },
            data: { label: 'Upload Image' },
          },
          {
            id: 'node-2',
            type: 'text',
            position: { x: 100, y: 320 },
            data: {
              label: 'System Prompt',
              text: 'You are a professional marketing copywriter. Generate a compelling one-paragraph product description.',
            },
          },
          {
            id: 'node-3',
            type: 'text',
            position: { x: 100, y: 520 },
            data: {
              label: 'Product Details',
              text: 'Product: Wireless Bluetooth Headphones. Features: Noise cancellation, 30-hour battery, foldable design.',
            },
          },
          {
            id: 'node-4',
            type: 'cropImage',
            position: { x: 440, y: 100 },
            data: {
              label: 'Crop Image',
              xPercent: 10,
              yPercent: 10,
              widthPercent: 80,
              heightPercent: 80,
            },
          },
          {
            id: 'node-5',
            type: 'llm',
            position: { x: 760, y: 180 },
            data: {
              label: 'LLM Node #1',
              model: DEFAULT_GEMINI_MODEL,
            },
          },
          {
            id: 'node-6',
            type: 'uploadVideo',
            position: { x: 100, y: 720 },
            data: { label: 'Upload Video' },
          },
          {
            id: 'node-7',
            type: 'extractFrame',
            position: { x: 440, y: 720 },
            data: {
              label: 'Extract Frame',
              timestamp: '50%',
            },
          },
          {
            id: 'node-8',
            type: 'text',
            position: { x: 760, y: 620 },
            data: {
              label: 'Social Media Prompt',
              text: 'You are a social media manager. Create a tweet-length marketing post based on the product image and video frame.',
            },
          },
          {
            id: 'node-9',
            type: 'llm',
            position: { x: 1100, y: 400 },
            data: {
              label: 'LLM Node #2 (Convergence)',
              model: DEFAULT_GEMINI_MODEL,
            },
          },
        ],
        edges: [
          {
            id: 'e1',
            source: 'node-1',
            sourceHandle: 'output',
            target: 'node-4',
            targetHandle: 'image_url',
            animated: true,
            style: { stroke: '#8b5cf6', strokeWidth: 2 },
          },
          {
            id: 'e2',
            source: 'node-2',
            sourceHandle: 'output',
            target: 'node-5',
            targetHandle: 'system_prompt',
            animated: true,
            style: { stroke: '#8b5cf6', strokeWidth: 2 },
          },
          {
            id: 'e3',
            source: 'node-3',
            sourceHandle: 'output',
            target: 'node-5',
            targetHandle: 'user_message',
            animated: true,
            style: { stroke: '#8b5cf6', strokeWidth: 2 },
          },
          {
            id: 'e4',
            source: 'node-4',
            sourceHandle: 'output',
            target: 'node-5',
            targetHandle: 'images',
            animated: true,
            style: { stroke: '#8b5cf6', strokeWidth: 2 },
          },
          {
            id: 'e5',
            source: 'node-6',
            sourceHandle: 'output',
            target: 'node-7',
            targetHandle: 'video_url',
            animated: true,
            style: { stroke: '#8b5cf6', strokeWidth: 2 },
          },
          {
            id: 'e6',
            source: 'node-5',
            sourceHandle: 'output',
            target: 'node-9',
            targetHandle: 'user_message',
            animated: true,
            style: { stroke: '#8b5cf6', strokeWidth: 2 },
          },
          {
            id: 'e7',
            source: 'node-4',
            sourceHandle: 'output',
            target: 'node-9',
            targetHandle: 'images',
            animated: true,
            style: { stroke: '#8b5cf6', strokeWidth: 2 },
          },
          {
            id: 'e8',
            source: 'node-7',
            sourceHandle: 'output',
            target: 'node-9',
            targetHandle: 'images',
            animated: true,
            style: { stroke: '#8b5cf6', strokeWidth: 2 },
          },
          {
            id: 'e9',
            source: 'node-8',
            sourceHandle: 'output',
            target: 'node-9',
            targetHandle: 'system_prompt',
            animated: true,
            style: { stroke: '#8b5cf6', strokeWidth: 2 },
          },
        ],
      },
    },
  })
}
