import { z } from 'zod'

// ── Workflow ──
export const CreateWorkflowSchema = z.object({
  name: z.string().min(1).max(200).optional().default('Untitled Workflow'),
})

export const UpdateWorkflowSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  nodes: z.array(z.record(z.string(), z.unknown())).optional(),
  edges: z.array(z.record(z.string(), z.unknown())).optional(),
})

export const ImportWorkflowSchema = z.object({
  workflowJson: z.string().min(1),
})

// ── Run ──
export const TriggerRunSchema = z.object({
  scope: z.enum(['FULL', 'PARTIAL', 'SINGLE']),
  nodeIds: z.array(z.string()).optional(),
})

// ── Upload ──
export const UploadSignatureSchema = z.object({
  uploadType: z.enum(['image', 'video']),
})

// ── Inferred types ──
export type CreateWorkflowInput = z.infer<typeof CreateWorkflowSchema>
export type UpdateWorkflowInput = z.infer<typeof UpdateWorkflowSchema>
export type ImportWorkflowInput = z.infer<typeof ImportWorkflowSchema>
export type TriggerRunInput = z.infer<typeof TriggerRunSchema>
export type UploadSignatureInput = z.infer<typeof UploadSignatureSchema>
