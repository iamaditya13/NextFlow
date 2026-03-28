'use client'

import { Handle, Position, type NodeProps, useNodeConnections } from '@xyflow/react'
import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Info,
  Pencil,
  RefreshCw,
  Upload,
  X,
} from 'lucide-react'

export type KreaImageNodeData = {
  label?: string
  model?: string
  credits?: string
  prompt?: string
  resultImage?: string
  raw?: boolean
  seed?: string
  aspectRatio?: string
  resolution?: string
  strength?: number
  executionStatus?: string
  nodeOutput?: unknown
  onUpdateData?: (data: Record<string, unknown>) => void
  onDelete?: () => void
  onRun?: () => void
}

const MODELS = [
  { value: 'krea-1', label: 'Krea 1' },
  { value: 'krea-2-beta', label: 'Krea 2 (Beta)' },
  { value: 'wan-2.1', label: 'Wan 2.1' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'flux-pro', label: 'Flux Pro' },
]

export function KreaImageNode({ data, selected }: NodeProps) {
  const [settingsOpen, setSettingsOpen] = useState(true)
  const nodeData = data as unknown as KreaImageNodeData

  const isRunning = nodeData.executionStatus === 'RUNNING'

  // Detect receiving state on image-prompt handle
  const imagePromptConns = useNodeConnections({ handleType: 'target', handleId: 'image-prompt' })
  const isReceivingImagePrompt = imagePromptConns.length > 0

  const currentModelLabel =
    MODELS.find((m) => m.value === nodeData.model)?.label ?? 'Krea 1'

  return (
    <div className="relative">
      {/* Info bar above node */}
      <div className="absolute -top-6 left-0 right-0 flex items-center justify-between px-1 pointer-events-none">
        <span className="text-[11px] dark:text-[#737373] text-gray-500 px-1 py-0.5 truncate max-w-[130px]">
          {currentModelLabel}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-[11px] dark:text-[#737373] text-gray-500">
            {nodeData.credits || '6'} CU
          </span>
          <Info className="w-3 h-3 dark:text-[#737373] text-gray-400" />
        </div>
      </div>

      {/* Node card */}
      <div
        className={[
          'w-[310px] rounded-xl overflow-hidden',
          'dark:bg-[#1a1a1a] bg-white',
          isRunning
            ? 'krea-node-breathing ring-2 ring-[#6b6bff]'
            : selected
            ? 'ring-2 ring-[#3b82f6]'
            : 'ring-[0.5px] dark:ring-white/[0.08] ring-black/[0.08]',
        ].join(' ')}
      >
        {/* Image preview */}
        <div className="w-full aspect-square dark:bg-[#141414] bg-[#f0f0f0] flex items-center justify-center relative overflow-hidden">
          {nodeData.resultImage ? (
            <img
              src={nodeData.resultImage}
              className="w-full h-full object-cover"
              alt="Result"
            />
          ) : (
            <span className="text-[11px] dark:text-[#525252] text-[#9ca3af]">
              Results will appear here
            </span>
          )}
        </div>

        {/* Image output row + handle */}
        <div className="relative flex items-center justify-end px-3 h-7 border-t dark:border-white/5 border-black/5">
          <span className="text-[11px] dark:text-[#737373] text-[#9ca3af] mr-1">Image</span>
          <Handle
            type="source"
            position={Position.Right}
            className="!w-2.5 !h-2.5 !bg-[#3b82f6] !border-0 !-right-[5px]"
            style={{ boxShadow: '0 0 0 3px rgba(59,130,246,0.25)' }}
          />
        </div>

        {/* Model selector row */}
        <div className="flex items-center px-3 h-7 border-t dark:border-white/5 border-black/5 gap-2">
          <span className="text-[11.7px] dark:text-[#737373] text-[#9ca3af] w-14 shrink-0">
            Model
          </span>
          <div className="flex-1 relative">
            <select
              value={nodeData.model || 'krea-1'}
              onChange={(e) => nodeData.onUpdateData?.({ model: e.target.value })}
              className="w-full h-[22px] px-2 pr-6 rounded-md text-[11px]
                         dark:bg-[#141414] dark:text-white bg-[#f5f5f5] text-gray-900
                         border-none outline-none appearance-none cursor-pointer nodrag"
            >
              {MODELS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-[#737373] absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Prompt row */}
        <div className="relative flex items-center px-3 h-7 border-t dark:border-white/5 border-black/5 gap-2">
          <Handle
            type="target"
            id="prompt"
            position={Position.Left}
            className="!w-2.5 !h-2.5 !bg-[#eab308] !border-0 !-left-[5px]"
            style={{ boxShadow: '0 0 0 3px rgba(234,179,8,0.25)' }}
          />
          <span className="text-[11.7px] dark:text-[#737373] text-[#9ca3af]">Prompt</span>
          <Pencil className="w-2.5 h-2.5 dark:text-[#737373] text-gray-400 ml-auto" />
        </div>

        {/* Prompt textarea */}
        <div className="px-3 pb-3">
          <textarea
            value={nodeData.prompt || ''}
            onChange={(e) => nodeData.onUpdateData?.({ prompt: e.target.value })}
            placeholder="A beautiful sunset over a calm ocean"
            className="w-full h-[90px] resize-none text-[11.5px] rounded-md p-1.5
                       dark:bg-[#141414] dark:text-white dark:placeholder-[#525252]
                       bg-[#f5f5f5] text-gray-900 placeholder-gray-400
                       dark:border-white/[0.15] border-black/[0.08] border
                       focus:outline-none nodrag"
            style={{ borderColor: 'var(--nf-border-inner)' }}
          />
        </div>

        {/* Settings toggle */}
        <div className="flex items-center px-3 h-7 border-t dark:border-white/5 border-black/5">
          <button
            type="button"
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="flex items-center gap-1 text-[11.5px] dark:text-[#525252] text-[#9ca3af] hover:opacity-80 nodrag"
          >
            <ChevronRight
              className={`w-3 h-3 transition-transform ${settingsOpen ? 'rotate-90' : ''}`}
            />
            <span>Settings</span>
          </button>
        </div>

        {/* Settings panel */}
        {settingsOpen && (
          <div className="border-t dark:border-white/5 border-black/5 px-3 py-2 flex flex-col gap-1.5">
            {/* Image Prompt */}
            <div className="relative flex items-center gap-2 h-6">
              <Handle
                type="target"
                position={Position.Left}
                id="image-prompt"
                className="!w-2 !h-2 !border-0 !-left-3"
                style={{ background: '#3b82f6' }}
              />
              <span className="text-[10.5px] dark:text-[#737373] text-gray-400 w-[68px] shrink-0">
                Image Prompt
              </span>
              {isReceivingImagePrompt ? (
                <div
                  className="flex-1 flex items-center gap-1 h-5 px-1.5 rounded
                                dark:bg-[#1c2a3a] bg-blue-50 border border-[#3b82f6]/30
                                text-[10.5px] text-[#3b82f6]"
                >
                  <div className="w-2 h-2 rounded-sm bg-[#3b82f6]/60 shrink-0" />
                  <span className="flex-1 truncate">Receiving...</span>
                  <X className="w-2.5 h-2.5 shrink-0 hover:text-red-400 cursor-pointer" />
                </div>
              ) : (
                <button
                  type="button"
                  className="flex-1 flex items-center gap-1 h-5 px-1.5 rounded
                             dark:bg-[#141414] bg-[#f5f5f5]
                             text-[10.5px] dark:text-[#737373] text-gray-500 nodrag"
                >
                  Add file <Upload className="w-2.5 h-2.5 ml-auto" />
                </button>
              )}
            </div>

            {/* Strength — only shown when receiving */}
            {isReceivingImagePrompt && (
              <div className="flex items-center gap-2 h-5 pl-[76px]">
                <span className="text-[10.5px] dark:text-[#737373] text-gray-400 shrink-0">
                  Strength
                </span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={nodeData.strength ?? 80}
                  onChange={(e) =>
                    nodeData.onUpdateData?.({ strength: Number(e.target.value) })
                  }
                  className="flex-1 h-5 px-1.5 rounded text-[10.5px]
                             dark:bg-[#141414] bg-[#f5f5f5]
                             dark:text-white text-gray-900
                             border-none outline-none nodrag"
                />
              </div>
            )}

            {/* Style */}
            <SettingsRow label="Style" handleColor="#ef4444" handleId="style">
              <button
                type="button"
                className="flex-1 h-5 px-1.5 rounded text-left
                           dark:bg-[#141414] bg-[#f5f5f5]
                           text-[10.5px] dark:text-[#737373] text-gray-500 nodrag"
              >
                Select style
              </button>
            </SettingsRow>

            {/* Style Image */}
            <SettingsRow label="Style Image" handleColor="#ef4444" handleId="style-image">
              <button
                type="button"
                className="flex-1 flex items-center gap-1 h-5 px-1.5 rounded
                           dark:bg-[#141414] bg-[#f5f5f5]
                           text-[10.5px] dark:text-[#737373] text-gray-500 nodrag"
              >
                Add file <Upload className="w-2.5 h-2.5 ml-auto" />
              </button>
            </SettingsRow>

            {/* Raw toggle */}
            <div className="flex items-center gap-2 h-6">
              <span className="text-[10.5px] dark:text-[#737373] text-gray-400 w-[68px] shrink-0">
                Raw
              </span>
              <button
                type="button"
                onClick={() => nodeData.onUpdateData?.({ raw: !nodeData.raw })}
                className={`relative w-8 h-4 rounded-full transition-colors nodrag ${
                  nodeData.raw ? 'bg-[#3b82f6]' : 'dark:bg-[#262626] bg-gray-200'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${
                    nodeData.raw ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Seed */}
            <SettingsRow label="Seed" handleColor="#d946ef" handleId="seed">
              <button
                type="button"
                className="flex-1 flex items-center justify-between h-5 px-1.5 rounded
                           dark:bg-[#141414] bg-[#f5f5f5]
                           text-[10.5px] dark:text-[#737373] text-gray-500 nodrag"
              >
                <span>{nodeData.seed || 'Random'}</span>
                <RefreshCw className="w-2.5 h-2.5" />
              </button>
            </SettingsRow>

            {/* Aspect Ratio */}
            <div className="flex items-center gap-2 h-6">
              <span className="text-[10.5px] dark:text-[#737373] text-gray-400 w-[68px] shrink-0">
                Aspect Ratio
              </span>
              <select
                value={nodeData.aspectRatio || '1:1'}
                onChange={(e) => nodeData.onUpdateData?.({ aspectRatio: e.target.value })}
                className="flex-1 h-5 px-1.5 rounded text-[10.5px]
                           dark:bg-[#141414] dark:text-[#737373] bg-[#f5f5f5] text-gray-500
                           border-none outline-none nodrag"
              >
                <option value="1:1">1:1</option>
                <option value="16:9">16:9</option>
                <option value="9:16">9:16</option>
                <option value="4:3">4:3</option>
              </select>
            </div>

            {/* Resolution */}
            <div className="flex items-center gap-2 h-6">
              <span className="text-[10.5px] dark:text-[#737373] text-gray-400 w-[68px] shrink-0">
                Resolution
              </span>
              <select
                value={nodeData.resolution || '1K'}
                onChange={(e) => nodeData.onUpdateData?.({ resolution: e.target.value })}
                className="flex-1 h-5 px-1.5 rounded text-[10.5px]
                           dark:bg-[#141414] dark:text-[#737373] bg-[#f5f5f5] text-gray-500
                           border-none outline-none nodrag"
              >
                <option value="1K">1K</option>
                <option value="2K">2K</option>
                <option value="4K">4K</option>
                <option value="8K">8K</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SettingsRow({
  label,
  handleColor,
  handleId,
  children,
}: {
  label: string
  handleColor: string
  handleId: string
  children: React.ReactNode
}) {
  return (
    <div className="relative flex items-center gap-2 h-6">
      <Handle
        type="target"
        position={Position.Left}
        id={handleId}
        className="!w-2 !h-2 !border-0 !-left-3"
        style={{ background: handleColor }}
      />
      <span className="text-[10.5px] dark:text-[#737373] text-gray-400 w-[68px] shrink-0">
        {label}
      </span>
      {children}
    </div>
  )
}
