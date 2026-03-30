'use client'
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-black/85 flex items-center justify-center p-4">
      <SignUp
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            cardBox: 'shadow-2xl rounded-2xl',
          },
        }}
        forceRedirectUrl="/dashboard"
        fallbackRedirectUrl="/dashboard"
        signInForceRedirectUrl="/dashboard"
        signInFallbackRedirectUrl="/dashboard"
      />
    </div>
  )
}
