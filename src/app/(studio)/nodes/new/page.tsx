import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function NewNodeEditorPage() {
  const { userId: clerkId } = await auth()
  if (!clerkId) redirect('/sign-in')

  let user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user) {
    const clerkUser = await currentUser()
    const email =
      clerkUser?.emailAddresses[0]?.emailAddress ?? `${clerkId}@no-email.local`
    user = await prisma.user.create({ data: { clerkId, email } })
  }

  const workflow = await prisma.workflow.create({
    data: { name: 'Untitled Workflow', userId: user.id, data: {} },
  })

  redirect(`/nodes/${workflow.id}`)
}
