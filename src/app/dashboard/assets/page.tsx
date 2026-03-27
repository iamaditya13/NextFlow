import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { AssetsPage } from '@/components/dashboard/AssetsPage'

export default async function AssetsRoute() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  return <AssetsPage />
}
