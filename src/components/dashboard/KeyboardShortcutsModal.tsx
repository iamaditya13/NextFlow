'use client'

import { Fragment } from 'react'
import { X } from 'lucide-react'

const shortcutSections = [
  {
    title: 'General',
    shortcuts: [
      { label: 'Undo', keys: ['Ctrl', 'Z'] },
      { label: 'Redo', keys: ['Ctrl', 'Shift', 'Z'] },
      { label: 'Save', keys: ['Ctrl', 'S'] },
      { label: 'Select all', keys: ['Ctrl', 'A'] },
      { label: 'Deselect all', keys: ['Esc'] },
      { label: 'Multi-select', keys: ['Shift', 'Click', 'or', 'Ctrl', 'Drag'] },
      { label: 'Pan canvas', keys: ['Space', 'Drag'] },
      { label: 'Cut edges (Scissor)', keys: ['X', 'Drag'] },
    ],
  },
  {
    title: 'Node Creation',
    shortcuts: [
      { label: 'Open node picker', keys: ['N'] },
      { label: 'Add Image node', keys: ['I'] },
      { label: 'Add Video node', keys: ['V'] },
      { label: 'Add LLM node', keys: ['L'] },
      { label: 'Add Enhance node', keys: ['E'] },
    ],
  },
  {
    title: 'Node Operations',
    shortcuts: [
      { label: 'Duplicate', keys: ['Ctrl', 'D'] },
      { label: 'Delete', keys: ['Delete', 'or', 'Backspace'] },
    ],
  },
  {
    title: 'Execution',
    shortcuts: [
      { label: 'Run workflow', keys: ['Ctrl', 'Enter'] },
    ],
  },
  {
    title: 'View',
    shortcuts: [
      { label: 'Zoom in', keys: ['Ctrl', '+'] },
      { label: 'Zoom out', keys: ['Ctrl', '-'] },
    ],
  },
]

interface KeyboardShortcutsModalProps {
  open: boolean
  onClose: () => void
}

export function KeyboardShortcutsModal({ open, onClose }: KeyboardShortcutsModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[320px] max-h-[80vh] overflow-y-auto
                    dark:bg-[#1a1a1a] bg-white
                    dark:border-white/10 border-black/10 border
                    rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <h2 className="text-[16px] font-semibold dark:text-white text-gray-900">
              Keyboard Shortcuts
            </h2>
            <p className="text-[12px] dark:text-[#737373] text-gray-500 mt-1">
              Quickly navigate and create with these shortcuts.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full
                       dark:bg-[#262626] bg-gray-100 hover:opacity-80"
          >
            <X className="w-4 h-4 dark:text-white text-gray-900" />
          </button>
        </div>

        {/* Sections */}
        {shortcutSections.map((section) => (
          <div
            key={section.title}
            className="px-6 py-3 border-t dark:border-white/5 border-black/5"
          >
            <h3 className="text-[13px] font-semibold dark:text-white text-gray-900 mb-3">
              {section.title}
            </h3>
            {section.shortcuts.map((shortcut) => (
              <div
                key={shortcut.label}
                className="flex items-center justify-between py-1.5"
              >
                <span className="text-[12px] dark:text-[#d4d4d4] text-gray-700">
                  {shortcut.label}
                </span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, i) => (
                    <Fragment key={i}>
                      {key === 'or' ? (
                        <span className="text-[11px] dark:text-[#525252] text-gray-400 mx-0.5">
                          or
                        </span>
                      ) : (
                        <kbd
                          className="px-1.5 py-0.5 rounded-md text-[11px] font-medium
                                     dark:bg-[#2a2a2a] dark:border dark:border-white/15 dark:text-white
                                     bg-gray-100 border border-black/15 text-gray-900"
                        >
                          {key}
                        </kbd>
                      )}
                    </Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
