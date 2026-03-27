'use client'

import { FileText } from 'lucide-react'

export default function BillingPage() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <FileText className="w-5 h-5 text-gray-700" />
        <h2 className="text-lg font-semibold">Invoices</h2>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <FileText className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="font-semibold text-gray-700 mb-1">No invoices</h3>
        <p className="text-sm text-gray-500">You don&apos;t have any invoices yet.</p>
      </div>
    </div>
  )
}
