'use client'
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-black/85 flex items-center justify-center p-4">
      <SignIn
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            cardBox: 'shadow-2xl rounded-2xl',
          },
        }}
        forceRedirectUrl="/dashboard"
        fallbackRedirectUrl="/dashboard"
        signUpForceRedirectUrl="/dashboard"
        signUpFallbackRedirectUrl="/dashboard"
      />
    </div>
  )
}
