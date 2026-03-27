'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function WorkspaceSettingsPage() {
  const [workspaceName, setWorkspaceName] = useState('Default Workspace')
  const [copied, setCopied] = useState(false)

  const workspaceId = 'fd67fbdf-b7ab-4b36-bf13-b803e703175b'

  const handleCopyId = async () => {
    await navigator.clipboard.writeText(workspaceId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDeleteWorkspace = () => {
    if (window.confirm('Are you sure you want to delete this workspace? This action cannot be undone.')) {
      // Delete logic
    }
  }

  return (
    <div>
      {/* GENERAL */}
      <p className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-4 mt-8">
        General
      </p>

      {/* Avatar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-600 text-white font-bold rounded-full flex items-center justify-center text-sm shrink-0">
          F
        </div>
        <span className="text-sm text-gray-500">Visible to all workspace members</span>
      </div>

      {/* Workspace Name */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 block mb-1.5">Workspace Name</label>
        <input
          type="text"
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Workspace ID */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 block mb-1.5">Workspace ID</label>
        <div className="flex items-center gap-2">
          <div className="bg-gray-100 rounded-full px-4 py-1.5 text-sm text-gray-600 font-mono">
            {workspaceId}
          </div>
          <button
            onClick={handleCopyId}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors relative"
            title="Copy Workspace ID"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 text-gray-400" />
            )}
            {copied && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                Copied!
              </span>
            )}
          </button>
        </div>
      </div>

      {/* DOMAINS */}
      <p className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-4 mt-8">
        Domains
      </p>
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">Domain Management</h3>
        <p className="text-sm text-gray-500 mb-3">
          Configure custom domains for your workspace to use with your applications.
        </p>
        <button className="bg-gray-100 text-gray-600 rounded-lg px-4 py-2 text-sm hover:bg-gray-200 transition-colors">
          Upgrade to Enterprise
        </button>
      </div>

      {/* SECURITY */}
      <p className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-4 mt-8">
        Security
      </p>
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">SAML Single Sign-On (SSO)</h3>
        <p className="text-sm text-gray-500">
          Available on Enterprise plans.{' '}
          <span className="text-purple-600 cursor-pointer hover:underline font-medium">Upgrade</span>
        </p>
      </div>

      {/* ACCESS CONTROLS */}
      <p className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-4 mt-8">
        Access Controls
      </p>
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">Model Access Controls</h3>
        <p className="text-sm text-gray-500">
          Available on Business and Enterprise plans.{' '}
          <span className="text-purple-600 cursor-pointer hover:underline font-medium">Upgrade</span>
        </p>
      </div>

      {/* DANGER ZONE */}
      <p className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-4 mt-8">
        Danger Zone
      </p>
      <div className="border border-red-200 bg-red-50 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-red-700 mb-1">Delete Workspace</h3>
        <p className="text-sm text-red-500 mb-3">
          Once you delete a workspace, there is no going back. All data will be permanently removed.
        </p>
        <button
          onClick={handleDeleteWorkspace}
          className="bg-red-500 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-600 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
