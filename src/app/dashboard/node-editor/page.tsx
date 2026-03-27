import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { initializeSampleWorkflow } from '@/lib/sampleWorkflow'

export default async function NodeEditorPage() {
  const { userId: clerkId } = await auth()
  if (!clerkId) redirect('/sign-in')

  // Ensure user record exists
  let user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user) {
    const clerkUser = await currentUser()
    const email = clerkUser?.emailAddresses[0]?.emailAddress ?? `${clerkId}@no-email.local`
    user = await prisma.user.create({ data: { clerkId, email } })
  }

  // Check if user has any workflows; if not, create the sample one
  const count = await prisma.workflow.count({ where: { userId: user.id } })
  if (count === 0) {
    const sample = await initializeSampleWorkflow(user.id)
    redirect(`/dashboard/node-editor/${sample.id}`)
  }

  // Has workflows — redirect to the most recently updated one
  const latest = await prisma.workflow.findFirst({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    select: { id: true },
  })
  if (latest) redirect(`/dashboard/node-editor/${latest.id}`)

  redirect('/dashboard')
}
