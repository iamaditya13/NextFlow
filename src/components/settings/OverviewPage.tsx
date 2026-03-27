'use client'

import { useSettingsStore } from '@/stores/settingsStore'
import { ChevronDown } from 'lucide-react'

export default function OverviewPage() {
  const compute = useSettingsStore((s) => s.compute)
  const plan = useSettingsStore((s) => s.plan)

  const percentage = Math.round((compute.freeDaily / compute.freeDailyMax) * 100)

  return (
    <div className="space-y-5">
      {/* Active Workspace */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">Active Workspace</h3>
        <div className="border border-gray-200 rounded-lg p-4">
          <button className="flex items-center gap-3 w-full text-left">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
              D
            </div>
            <span className="text-sm text-gray-900 flex-1">Default Workspace</span>
            <ChevronDown size={16} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Default Workspace */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
            D
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">Default Workspace</span>
              <span
                className="text-xs px-2 py-0.5 rounded capitalize"
                style={{ border: '1px solid #e5e5e5' }}
              >
                {plan}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
                Manage Workspace
              </button>
              <button className="bg-black text-white rounded-full px-4 py-1.5 text-sm hover:bg-gray-800 transition-colors">
                Upgrade
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Free Compute */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <div className="text-4xl font-bold text-gray-900">{compute.freeDaily}</div>
            <div className="text-sm text-gray-500">Daily Allowance</div>
          </div>
          <div className="text-sm text-gray-500">
            {compute.freeDaily} / {compute.freeDailyMax}
          </div>
        </div>
        <div className="h-1.5 rounded-full bg-gray-200 mt-3">
          <div
            className="h-full rounded-full bg-blue-500 transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div
          className="mt-2 font-semibold text-gray-400"
          style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}
        >
          FREE COMPUTE
        </div>
      </div>

      {/* One-Time Compute */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl font-bold text-gray-900">{compute.oneTime}</div>
            <div className="text-sm text-gray-500">No compute packs purchased</div>
          </div>
          <button className="text-sm text-blue-500 hover:text-blue-600 font-medium transition-colors">
            + Buy
          </button>
        </div>
        <div
          className="mt-2 font-semibold text-gray-400"
          style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}
        >
          ONE-TIME COMPUTE
        </div>
      </div>
    </div>
  )
}
