import { NextRequest } from 'next/server'
import { createHmac } from 'crypto'
import { UploadSignatureSchema } from '@/lib/validations'
import { authenticateUser, success, error, zodError } from '@/lib/apiHelpers'

export async function POST(req: NextRequest) {
  try {
    const [_user, authError] = await authenticateUser()
    if (authError) return authError

    const body = await req.json()
    let parsed
    try {
      parsed = UploadSignatureSchema.parse(body)
    } catch (e) {
      return zodError(e)
    }

    const authKey = process.env.NEXT_PUBLIC_TRANSLOADIT_KEY
    const authSecret = process.env.TRANSLOADIT_SECRET

    if (!authKey || !authSecret) {
      return error('Transloadit not configured', 500)
    }

    const templateId =
      parsed.uploadType === 'image'
        ? process.env.TRANSLOADIT_TEMPLATE_ID_IMAGE
        : process.env.TRANSLOADIT_TEMPLATE_ID_VIDEO

    const expires = new Date(Date.now() + 3600000)
      .toISOString()
      .replace('T', ' ')
      .replace(/\.\d{3}Z/, '+00:00')

    const params = JSON.stringify({
      auth: { key: authKey, expires },
      template_id: templateId,
    })

    const signature = createHmac('sha384', authSecret)
      .update(Buffer.from(params, 'utf-8'))
      .digest('hex')

    return success({
      params,
      signature: `sha384:${signature}`,
      expires,
    })
  } catch (e) {
    return error('Internal server error', 500)
  }
}
