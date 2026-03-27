import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { EditPage } from '@/components/dashboard/EditPage'

export default async function EditRoute() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  return <EditPage />
}
