import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { DashboardClient } from '@/components/dashboard/DashboardClient'
import { prisma } from '@/lib/prisma'

export default async function WorkflowEditorPage({ params }: { params: Promise<{ workflowId: string }> }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-up')

  const { workflowId } = await params

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
  }

  const workflows = await prisma.workflow.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      name: true,
      updatedAt: true,
      createdAt: true,
    },
  })

  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId, userId: user.id },
  })

  if (!workflow) {
    redirect('/dashboard/node-editor')
  }

  const runs = await prisma.workflowRun.findMany({
    where: { workflowId: workflowId },
    orderBy: { startedAt: 'desc' },
    take: 50,
    include: {
      nodeResults: {
        orderBy: { startedAt: 'asc' },
      },
    },
  })

  return (
    <DashboardClient
      userId={user.id}
      initialWorkflows={JSON.parse(JSON.stringify(workflows))}
      initialWorkflow={JSON.parse(JSON.stringify(workflow))}
      initialRuns={JSON.parse(JSON.stringify(runs))}
    />
  )
}
