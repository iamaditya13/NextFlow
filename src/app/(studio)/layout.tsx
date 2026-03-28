import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-up')

  return (
    <div
      style={{
        height: '100vh',
        background: 'var(--nf-bg-canvas)',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  )
}
