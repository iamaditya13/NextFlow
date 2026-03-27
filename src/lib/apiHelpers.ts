import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { initializeSampleWorkflow } from '@/lib/sampleWorkflow'

export function success(data: unknown, status = 200) {
  return Response.json({ success: true, data }, { status })
}

export function error(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status })
}

export function zodError(err: unknown) {
  if (err && typeof err === 'object' && 'issues' in err) {
    const issues = (err as { issues: Array<{ message: string; path: Array<string | number> }> }).issues
    const messages = issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
    return error(messages, 400)
  }
  return error('Validation error', 400)
}

/**
 * Authenticates the request and returns the internal user record.
 * If the user doesn't exist in our DB yet (webhook hasn't fired),
 * we auto-create them from Clerk data.
 */
export async function authenticateUser(): Promise<
  [{ id: string; clerkId: string; email: string }, null] | [null, Response]
> {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    return [null, error('Unauthorized', 401)]
  }

  let user = await prisma.user.findUnique({
    where: { clerkId },
  })

  if (!user) {
    // Auto-create from Clerk data (fallback for when webhook hasn't fired yet)
    try {
      const clerkUser = await currentUser()
      const email = clerkUser?.emailAddresses?.[0]?.emailAddress || `${clerkId}@placeholder.com`
      user = await prisma.user.create({
        data: { clerkId, email },
      })
      // Auto-create sample workflow for new users
      try {
        await initializeSampleWorkflow(user.id)
      } catch {
        // Non-critical
      }
    } catch {
      return [null, error('Unable to create user', 500)]
    }
  }

  return [user, null]
}
