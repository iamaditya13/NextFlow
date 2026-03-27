'use client'

import { Lock } from 'lucide-react'

interface PackCard {
  units: string
  requirement: string
}

const packs: PackCard[] = [
  { units: '2,000', requirement: 'Basic Subscription Required' },
  { units: '5,000', requirement: 'Pro Subscription Required' },
  { units: '10,000', requirement: 'Pro Subscription Required' },
  { units: '24,000', requirement: 'Pro Subscription Required' },
  { units: '50,000', requirement: 'Pro Subscription Required' },
]

function ChipSvg() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Central chip */}
      <rect x="24" y="24" width="32" height="32" rx="4" stroke="#d1d5db" strokeWidth="2" fill="#f9fafb" />
      <rect x="30" y="30" width="20" height="20" rx="2" stroke="#d1d5db" strokeWidth="1.5" fill="#f3f4f6" />
      {/* Top pins */}
      <line x1="32" y1="24" x2="32" y2="14" stroke="#d1d5db" strokeWidth="1.5" />
      <line x1="40" y1="24" x2="40" y2="14" stroke="#d1d5db" strokeWidth="1.5" />
      <line x1="48" y1="24" x2="48" y2="14" stroke="#d1d5db" strokeWidth="1.5" />
      {/* Bottom pins */}
      <line x1="32" y1="56" x2="32" y2="66" stroke="#d1d5db" strokeWidth="1.5" />
      <line x1="40" y1="56" x2="40" y2="66" stroke="#d1d5db" strokeWidth="1.5" />
      <line x1="48" y1="56" x2="48" y2="66" stroke="#d1d5db" strokeWidth="1.5" />
      {/* Left pins */}
      <line x1="24" y1="32" x2="14" y2="32" stroke="#d1d5db" strokeWidth="1.5" />
      <line x1="24" y1="40" x2="14" y2="40" stroke="#d1d5db" strokeWidth="1.5" />
      <line x1="24" y1="48" x2="14" y2="48" stroke="#d1d5db" strokeWidth="1.5" />
      {/* Right pins */}
      <line x1="56" y1="32" x2="66" y2="32" stroke="#d1d5db" strokeWidth="1.5" />
      <line x1="56" y1="40" x2="66" y2="40" stroke="#d1d5db" strokeWidth="1.5" />
      <line x1="56" y1="48" x2="66" y2="48" stroke="#d1d5db" strokeWidth="1.5" />
      {/* Corner circuit traces */}
      <path d="M14 32 L8 32 L8 16 L32 16 L32 14" stroke="#d1d5db" strokeWidth="1" fill="none" />
      <path d="M66 32 L72 32 L72 16 L48 16 L48 14" stroke="#d1d5db" strokeWidth="1" fill="none" />
      <path d="M14 48 L8 48 L8 64 L32 64 L32 66" stroke="#d1d5db" strokeWidth="1" fill="none" />
      <path d="M66 48 L72 48 L72 64 L48 64 L48 66" stroke="#d1d5db" strokeWidth="1" fill="none" />
      {/* Center dot */}
      <circle cx="40" cy="40" r="3" fill="#d1d5db" />
    </svg>
  )
}

export default function ComputePacksPage() {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-6">
        Purchase additional compute credits that are valid for 90 days. Choose from our
        pre-configured packs below. To get the most credits out of your purchase, consider
        upgrading your plan.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {packs.map((pack) => (
          <div
            key={pack.units}
            className="bg-white border rounded-xl p-5 flex flex-col items-center"
          >
            <span className="text-xs text-gray-400 mb-2">Valid for 90 days</span>
            <span className="text-3xl font-bold mb-3">{pack.units}</span>
            <div className="mb-4">
              <ChipSvg />
            </div>
            <span className="text-xs text-gray-400 mb-2">Units</span>
            <button
              disabled
              className="bg-gray-100 text-gray-500 rounded-lg px-4 py-2 text-xs font-medium cursor-not-allowed flex items-center gap-1.5"
            >
              <Lock className="w-3 h-3" />
              {pack.requirement}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
