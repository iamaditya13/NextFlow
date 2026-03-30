'use client'
import { SignUp } from '@clerk/nextjs'

const SIGN_UP_PATH = '/sign-up'
const SIGN_IN_PATH = '/sign-in'
const DASHBOARD_PATH = '/dashboard'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-black/85 flex items-center justify-center p-4">
      <SignUp
        path={SIGN_UP_PATH}
        routing="path"
        signInUrl={SIGN_IN_PATH}
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            cardBox: 'shadow-2xl rounded-2xl',
          },
        }}
        forceRedirectUrl={DASHBOARD_PATH}
        fallbackRedirectUrl={DASHBOARD_PATH}
        signInForceRedirectUrl={DASHBOARD_PATH}
        signInFallbackRedirectUrl={DASHBOARD_PATH}
      />
    </div>
  )
}
