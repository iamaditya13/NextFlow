'use client'
import { SignIn } from '@clerk/nextjs'

const SIGN_UP_PATH = '/sign-up'
const SIGN_IN_PATH = '/sign-in'
const DASHBOARD_PATH = '/dashboard'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-black/85 flex items-center justify-center p-4">
      <SignIn
        path={SIGN_IN_PATH}
        routing="path"
        signUpUrl={SIGN_UP_PATH}
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            cardBox: 'shadow-2xl rounded-2xl',
          },
        }}
        forceRedirectUrl={DASHBOARD_PATH}
        fallbackRedirectUrl={DASHBOARD_PATH}
        signUpForceRedirectUrl={DASHBOARD_PATH}
        signUpFallbackRedirectUrl={DASHBOARD_PATH}
      />
    </div>
  )
}
