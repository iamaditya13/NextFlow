'use client'

import { useMemo, useState } from 'react'
import { UserButton } from '@clerk/nextjs'
import {
  Bot,
  ChevronLeft,
  Film,
  Image,
  MoreHorizontal,
  Plus,
  Search,
  Type,
  Video,
  Crop,
} from 'lucide-react'

type NodeTypeDef = {
  type: string
  label: string
  color: string
  icon: React.ComponentType<{ size?: number; color?: string }>
}

const NODE_TYPES: NodeTypeDef[] = [
  { type: 'text', label: 'Text Node', color: '#eab308', icon: Type },
  { type: 'uploadImage', label: 'Upload Image', color: '#3b82f6', icon: Image },
  { type: 'uploadVideo', label: 'Upload Video', color: '#22c55e', icon: Video },
  { type: 'llm', label: 'LLM Node', color: '#8b5cf6', icon: Bot },
  { type: 'cropImage', label: 'Crop Image', color: '#3b82f6', icon: Crop },
  { type: 'extractFrame', label: 'Extract Frame', color: '#22c55e', icon: Film },
]

interface WorkflowSummary {
  id: string
  name: string
  updatedAt: string
  createdAt: string
}

interface LeftSidebarProps {
  collapsed: boolean
  onToggle: () => void
  workflows: WorkflowSummary[]
  currentWorkflowId: string | null
  onLoadWorkflow: (id: string, name: string) => void
  onNewWorkflow: () => void
  onDeleteWorkflow: (id: string) => void
  onAddNode: (nodeType: string) => void
}

export function LeftSidebar({
  collapsed,
  onToggle,
  workflows,
  currentWorkflowId,
  onLoadWorkflow,
  onNewWorkflow,
  onDeleteWorkflow,
  onAddNode,
}: LeftSidebarProps) {
  const [query, setQuery] = useState('')
  const [menuWorkflowId, setMenuWorkflowId] = useState<string | null>(null)

  const filteredNodes = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return NODE_TYPES
    return NODE_TYPES.filter((node) => node.label.toLowerCase().includes(q))
  }, [query])

  const formatRelative = (value: string) => {
    const timestamp = new Date(value).getTime()
    const delta = Date.now() - timestamp

    const minutes = Math.floor(delta / 60000)
    const hours = Math.floor(delta / 3600000)
    const days = Math.floor(delta / 86400000)

    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <aside
      style={{
        width: collapsed ? 48 : 240,
        transition: 'width 0.2s ease',
        height: '100%',
        background: '#111111',
        borderRight: '1px solid #2a2a2a',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: 48,
          borderBottom: '1px solid #1a1a1a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? 0 : '0 12px',
          flexShrink: 0,
        }}
      >
        {!collapsed && (
          <div style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>Nodes</div>
        )}
        <button
          onClick={onToggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            width: 28,
            height: 28,
            border: 'none',
            borderRadius: 8,
            color: '#888888',
            background: 'transparent',
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
            transform: collapsed ? 'rotate(180deg)' : 'none',
          }}
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {!collapsed && (
        <div style={{ padding: 12, borderBottom: '1px solid #1a1a1a', flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={14}
              color="#555555"
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search nodes"
              style={{
                width: '100%',
                height: 32,
                borderRadius: 8,
                border: '1px solid #2a2a2a',
                background: '#1a1a1a',
                color: 'white',
                fontSize: 12,
                fontFamily: 'inherit',
                outline: 'none',
                padding: '0 10px 0 30px',
              }}
            />
          </div>
        </div>
      )}

      <div style={{ padding: '8px 8px 4px', flexShrink: 0 }}>
        {!collapsed && (
          <div
            style={{
              fontSize: 10,
              color: '#555555',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              margin: '4px 8px 8px',
            }}
          >
            Node Library
          </div>
        )}

        {filteredNodes.map((node) => {
          const Icon = node.icon

          return (
            <button
              key={node.type}
              draggable
              onDragStart={(event) => onDragStart(event, node.type)}
              onClick={() => onAddNode(node.type)}
              title={collapsed ? node.label : undefined}
              style={{
                width: '100%',
                height: 36,
                marginBottom: 4,
                border: 'none',
                borderRadius: 8,
                background: 'transparent',
                color: '#ffffff',
                cursor: 'grab',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: 8,
                padding: collapsed ? 0 : '0 10px',
                fontFamily: 'inherit',
                fontSize: 12,
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background = '#1a1a1a'
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background = 'transparent'
              }}
            >
              <Icon size={15} color={node.color} />
              {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{node.label}</span>}
            </button>
          )
        })}
      </div>

      {!collapsed && <div style={{ height: 1, background: '#1a1a1a', margin: '8px 12px' }} />}

      {!collapsed && (
        <div style={{ padding: '0 8px', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 10,
              color: '#555555',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              margin: '0 8px 8px',
            }}
          >
            Workflows
          </div>

          <button
            onClick={onNewWorkflow}
            style={{
              width: '100%',
              height: 32,
              borderRadius: 8,
              border: '1px solid rgba(139,92,246,0.35)',
              background: 'rgba(139,92,246,0.15)',
              color: '#c4b5fd',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              fontFamily: 'inherit',
              fontSize: 12,
              marginBottom: 8,
            }}
          >
            <Plus size={14} />
            New Workflow
          </button>

          <div className="nf-scroll" style={{ overflowY: 'auto', minHeight: 0, flex: 1, paddingRight: 2 }}>
            {workflows.map((workflow) => {
              const active = workflow.id === currentWorkflowId
              const menuOpen = menuWorkflowId === workflow.id

              return (
                <div
                  key={workflow.id}
                  style={{
                    position: 'relative',
                    borderRadius: 8,
                    marginBottom: 4,
                    borderLeft: active ? '2px solid #8b5cf6' : '2px solid transparent',
                    background: active ? 'rgba(139,92,246,0.12)' : 'transparent',
                  }}
                >
                  <button
                    onClick={() => onLoadWorkflow(workflow.id, workflow.name)}
                    style={{
                      width: '100%',
                      border: 'none',
                      background: 'transparent',
                      color: 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                      padding: '8px 30px 8px 10px',
                      borderRadius: 8,
                      fontFamily: 'inherit',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {workflow.name}
                    </div>
                    <div style={{ fontSize: 10, color: '#666666', marginTop: 2 }}>
                      {formatRelative(workflow.updatedAt)}
                    </div>
                  </button>

                  <button
                    onClick={(event) => {
                      event.stopPropagation()
                      setMenuWorkflowId((current) =>
                        current === workflow.id ? null : workflow.id
                      )
                    }}
                    style={{
                      position: 'absolute',
                      top: 7,
                      right: 4,
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      border: 'none',
                      background: 'transparent',
                      color: '#777777',
                      cursor: 'pointer',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                    title="Workflow menu"
                  >
                    <MoreHorizontal size={14} />
                  </button>

                  {menuOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 32,
                        right: 4,
                        zIndex: 20,
                        borderRadius: 8,
                        border: '1px solid #2a2a2a',
                        background: '#151515',
                        minWidth: 110,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
                        padding: 4,
                      }}
                    >
                      <button
                        onClick={() => {
                          setMenuWorkflowId(null)
                          onDeleteWorkflow(workflow.id)
                        }}
                        style={{
                          width: '100%',
                          height: 30,
                          border: 'none',
                          background: 'transparent',
                          color: '#ef4444',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontSize: 12,
                          fontFamily: 'inherit',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: 'auto',
          height: 52,
          borderTop: '1px solid #1a1a1a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? 0 : '0 12px',
          gap: 8,
          flexShrink: 0,
        }}
      >
        <UserButton />
        {!collapsed && <span style={{ color: '#8a8a8a', fontSize: 12 }}>Account</span>}
      </div>
    </aside>
  )
}
