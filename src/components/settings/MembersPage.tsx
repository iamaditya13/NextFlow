'use client'

import { Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSettingsStore } from '@/stores/settingsStore'

export default function MembersPage() {
  const router = useRouter()
  const closeSettings = useSettingsStore((s) => s.closeSettings)

  const handleViewPlans = () => {
    closeSettings()
    router.push('/dashboard/pricing')
  }

  return (
    <div className="flex items-start justify-center pt-12">
      <div className="border rounded-xl p-8 max-w-md mx-auto flex flex-col items-center text-center">
        <div className="bg-gray-100 p-3 rounded-full mb-4">
          <Users className="w-6 h-6 text-gray-600" />
        </div>
        <h2 className="text-lg font-semibold mb-2">
          Upgrade to invite team members
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Your current plan doesn&apos;t support team collaboration. Upgrade to a
          Creator or Business plan to invite team members and work together.
        </p>
        <button
          onClick={handleViewPlans}
          className="bg-black text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          View Plans
        </button>
      </div>
    </div>
  )
}
