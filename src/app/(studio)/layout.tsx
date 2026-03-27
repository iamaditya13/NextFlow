import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  return (
    <div
      style={{
        height: '100vh',
        background: '#101010',
        overflow: 'hidden',
        fontFamily: 'Inter, -apple-system, sans-serif',
      }}
    >
      {children}
    </div>
  )
}
