'use client'

import { useState } from 'react'
import { Key, Trash2, Copy, Check } from 'lucide-react'
import { useSettingsStore } from '@/stores/settingsStore'

export default function ApiTokensPage() {
  const { apiTokens, addApiToken, removeApiToken } = useSettingsStore()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCreateToken = () => {
    const name = window.prompt('Enter a name for your API token:')
    if (name && name.trim()) {
      addApiToken(name.trim())
    }
  }

  const handleCopyToken = async (id: string, token: string) => {
    await navigator.clipboard.writeText(token)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Key className="w-5 h-5 text-gray-700" />
        <h2 className="text-lg font-semibold">API Tokens</h2>
      </div>

      {/* Getting started */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Get started with the Krea API</h3>

        <div className="space-y-4 mb-6">
          {/* Step 1 */}
          <div className="flex items-start gap-3">
            <div className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              1
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Create your first API token</p>
              <p className="text-sm text-gray-500">
                Click the button below to generate a secure token for API access
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3">
            <div className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              2
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Follow the documentation</p>
              <p className="text-sm text-gray-500">
                Check out our API docs for code examples and endpoints
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateToken}
            className="bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            + Create API Token
          </button>
          <button className="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            Get started with the documentation &rarr;
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-xs uppercase tracking-wider text-gray-400 font-medium text-left px-4 py-3">
                Name
              </th>
              <th className="text-xs uppercase tracking-wider text-gray-400 font-medium text-left px-4 py-3">
                Token
              </th>
              <th className="text-xs uppercase tracking-wider text-gray-400 font-medium text-left px-4 py-3">
                Created
              </th>
              <th className="text-xs uppercase tracking-wider text-gray-400 font-medium text-left px-4 py-3">
                Last Used
              </th>
              <th className="text-xs uppercase tracking-wider text-gray-400 font-medium text-left px-4 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {apiTokens.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center">
                  <span className="text-sm text-gray-400 italic">+ New Token</span>
                </td>
              </tr>
            ) : (
              apiTokens.map((t) => (
                <tr key={t.id} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700">{t.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <code className="text-sm text-gray-600 font-mono">
                        {t.token.slice(0, 8)}...
                      </code>
                      <button
                        onClick={() => handleCopyToken(t.id, t.token)}
                        className="p-1 rounded hover:bg-gray-100 transition-colors"
                        title="Copy token"
                      >
                        {copiedId === t.id ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{t.created}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{t.lastUsed}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => removeApiToken(t.id)}
                      className="p-1.5 rounded hover:bg-red-50 transition-colors"
                      title="Delete token"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
