import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { EnhancerPage } from '@/components/dashboard/EnhancerPage'

export default async function EnhancerRoute() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-up')

  return <EnhancerPage />
}
