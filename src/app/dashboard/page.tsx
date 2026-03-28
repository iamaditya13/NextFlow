import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { HomeDashboard } from '@/components/dashboard/HomeDashboard'
import { initializeSampleWorkflow } from '@/lib/sampleWorkflow'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) {
    return <HomeDashboard guestMode />
  }

  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) {
    const clerkUser = await currentUser()
    const email =
      clerkUser?.emailAddresses[0]?.emailAddress ?? `${userId}@no-email.local`

    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email,
      },
    })

    await initializeSampleWorkflow(user.id)
  }

  return <HomeDashboard />
}
