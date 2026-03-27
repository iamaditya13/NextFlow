'use client'

import { useState } from 'react'

export default function PromoPage() {
  const [code, setCode] = useState('')

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8">
      <h2 className="text-2xl font-bold tracking-widest text-gray-300 text-center">
        ENTER PROMO CODE
      </h2>
      <input
        type="text"
        className="max-w-sm w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white text-gray-900"
        placeholder="Enter code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
    </div>
  )
}
