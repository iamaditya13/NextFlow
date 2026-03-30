'use client'

import { useState } from 'react'
import { Handle, Position, useNodeConnections } from '@xyflow/react'
import { ChevronDown, ChevronRight, X } from 'lucide-react'
import {
  GEMINI_MODEL_OPTIONS,
  normalizeGeminiModel,
} from '@/lib/models/geminiModels'

interface LLMNodeData {
  label?: string
  model?: string
  userMessage?: string
  systemPrompt?: string
  executionStatus?: string
  nodeOutput?: { text?: string; error?: string; waitingText?: string }
  onDelete?: () => void
  onUpdateData?: (updates: Record<string, unknown>) => void
  onRun?: () => void
}

function getStatusClass(status: string) {
  if (status === 'running') return 'nf-node--running'
  if (status === 'success') return 'nf-node--success'
  if (status === 'failed') return 'nf-node--failed'
  return ''
}

export function LLMNode({ data, selected }: { data: LLMNodeData; selected?: boolean }) {
  const status = (data.executionStatus || 'idle').toLowerCase()
  const [showSettings, setShowSettings] = useState(false)
  const selectedModel = normalizeGeminiModel(data.model)

  const systemPromptConnections = useNodeConnections({ handleType: 'target', handleId: 'system_prompt' })
  const userMessageConnections = useNodeConnections({ handleType: 'target', handleId: 'user_message' })
  const isSystemPromptConnected = systemPromptConnections.length > 0
  const isUserMessageConnected = userMessageConnections.length > 0

  return (
    <div className={`nf-node ${selected ? 'nf-node--selected-llm' : ''} ${getStatusClass(status)}`}>
      <Handle type="target" position={Position.Left} id="system_prompt" className="nf-handle nf-handle--text" style={{ top: '30%' }} />
      <Handle type="target" position={Position.Left} id="user_message" className="nf-handle nf-handle--text" style={{ top: '50%' }} />
      <Handle type="target" position={Position.Left} id="images" className="nf-handle nf-handle--image" style={{ top: '70%' }} />

      {/* Header tab — Figma: label above card */}
      <div className="nf-node__header">
        <span className="nf-node__title">{data.label || 'LLM Node'}</span>
        <span className={`nf-node__status-dot nf-node__status-dot--${status}`} />
        <button className="nf-node__delete" onClick={data.onDelete} title="Delete node">
          <X size={12} />
        </button>
      </div>

      <div className="nf-node__body">
        {/* Preview area — results or placeholder */}
        <div className="nf-node__preview-area">
          {typeof data.nodeOutput?.text === 'string' ? (
            <div style={{ padding: 16, fontSize: 'var(--nf-font-size-xs)', color: 'var(--nf-text-primary)', lineHeight: 1.5, overflow: 'auto', maxHeight: '100%', wordBreak: 'break-word' }}>
              {data.nodeOutput.text}
            </div>
          ) : data.nodeOutput?.error ? (
            <div style={{ padding: 16, fontSize: 'var(--nf-font-size-xs)', color: '#ef4444' }}>{data.nodeOutput.error}</div>
          ) : typeof data.nodeOutput?.waitingText === 'string' ? (
            <div style={{ padding: 16, fontSize: 'var(--nf-font-size-xs)', color: 'var(--nf-text-muted)', fontStyle: 'italic' }}>
              {data.nodeOutput.waitingText}
            </div>
          ) : (
            <p>Results will appear here</p>
          )}
        </div>

        {/* Model selector — Figma: field row with label */}
        <div className="nf-node__field nf-node__field--divider">
          <span className="nf-node__label">Model</span>
          <div className="nf-node__select-wrap">
            <select
              className="nf-node__select nf-node__select--with-icon"
              value={selectedModel}
              onChange={(e) => data.onUpdateData?.({ model: e.target.value })}
            >
              {GEMINI_MODEL_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <ChevronDown className="nf-node__select-indicator" size={12} />
          </div>
        </div>

        {/* Prompt area */}
        <div style={{ padding: '4px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="nf-node__label">Prompt</span>
          </div>
          <textarea
            className={`nf-node__textarea nf-node__textarea--sm ${isUserMessageConnected ? 'nf-node__textarea--connected' : ''}`}
            value={isUserMessageConnected ? 'Connected from upstream' : data.userMessage || ''}
            onChange={(e) => !isUserMessageConnected && data.onUpdateData?.({ userMessage: e.target.value })}
            placeholder="A beautiful sunset over a calm ocean"
            disabled={isUserMessageConnected}
            readOnly={isUserMessageConnected}
          />
        </div>

        {/* Settings toggle */}
        <button className="nf-node__settings-toggle" onClick={() => setShowSettings(!showSettings)} type="button">
          <ChevronRight size={12} style={{ transform: showSettings ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
          <span>Settings</span>
        </button>

        {showSettings && (
          <div style={{ padding: '0 16px 8px' }}>
            <div style={{ marginBottom: 6 }}>
              <span className="nf-node__label" style={{ marginBottom: 2, display: 'block' }}>System Prompt</span>
              <textarea
                className={`nf-node__textarea nf-node__textarea--sm ${isSystemPromptConnected ? 'nf-node__textarea--connected' : ''}`}
                value={isSystemPromptConnected ? 'Connected from upstream' : data.systemPrompt || ''}
                onChange={(e) => !isSystemPromptConnected && data.onUpdateData?.({ systemPrompt: e.target.value })}
                placeholder="Optional system prompt"
                disabled={isSystemPromptConnected}
                readOnly={isSystemPromptConnected}
                style={{ minHeight: 50 }}
              />
            </div>
          </div>
        )}

      </div>

      <Handle type="source" position={Position.Right} id="output" className="nf-handle nf-handle--text" style={{ top: '50%' }} />
    </div>
  )
}
