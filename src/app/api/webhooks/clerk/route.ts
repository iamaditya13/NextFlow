import { NextRequest } from 'next/server'
import { Webhook } from 'svix'
import { prisma } from '@/lib/prisma'
import { initializeSampleWorkflow } from '@/lib/sampleWorkflow'

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    return new Response('Missing CLERK_WEBHOOK_SECRET', { status: 500 })
  }

  const svixId = req.headers.get('svix-id') ?? ''
  const svixTimestamp = req.headers.get('svix-timestamp') ?? ''
  const svixSignature = req.headers.get('svix-signature') ?? ''

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  const body = await req.text()

  let event: any
  try {
    const wh = new Webhook(WEBHOOK_SECRET)
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    })
  } catch {
    return new Response('Invalid webhook signature', { status: 400 })
  }

  const { type, data } = event

  if (type === 'user.created') {
    const email =
      data.email_addresses?.find((e: any) => e.id === data.primary_email_address_id)
        ?.email_address || data.email_addresses?.[0]?.email_address || ''

    const user = await prisma.user.upsert({
      where: { clerkId: data.id },
      create: {
        clerkId: data.id,
        email,
      },
      update: {},
    })

    // Create sample workflow for new users
    try {
      await initializeSampleWorkflow(user.id)
    } catch {
      // Non-critical, continue
    }
  }

  if (type === 'user.updated') {
    const email =
      data.email_addresses?.find((e: any) => e.id === data.primary_email_address_id)
        ?.email_address || ''

    if (email) {
      await prisma.user.updateMany({
        where: { clerkId: data.id },
        data: { email },
      })
    }
  }

  if (type === 'user.deleted') {
    await prisma.user.deleteMany({
      where: { clerkId: data.id },
    })
  }

  return new Response('OK', { status: 200 })
}

export const runtime = 'nodejs'
