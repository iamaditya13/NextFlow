export async function uploadToTransloadit(
  filePath: string,
  mimeType: string,
  templateId?: string
): Promise<string> {
  const fs = await import('fs')
  const FormData = (await import('form-data')).default

  const authKey = process.env.NEXT_PUBLIC_TRANSLOADIT_KEY!
  const authSecret = process.env.TRANSLOADIT_SECRET!
  const template = templateId || process.env.TRANSLOADIT_TEMPLATE_ID_IMAGE!

  const expires = new Date(Date.now() + 3600000)
    .toISOString()
    .replace('T', ' ')
    .replace(/\.\d{3}Z/, '+00:00')

  const params = JSON.stringify({
    auth: { key: authKey, expires },
    template_id: template,
  })

  const crypto = await import('crypto')
  const signature = crypto
    .createHmac('sha384', authSecret)
    .update(Buffer.from(params, 'utf-8'))
    .digest('hex')

  const form = new FormData()
  form.append('params', params)
  form.append('signature', `sha384:${signature}`)
  form.append('file', fs.createReadStream(filePath), {
    contentType: mimeType,
  })

  const response = await fetch('https://api2.transloadit.com/assemblies', {
    method: 'POST',
    body: form as any,
    headers: form.getHeaders(),
  })

  const result: any = await response.json()

  if (result.error) {
    throw new Error(`Transloadit error: ${result.error}`)
  }

  let assembly: any = result
  let attempts = 0
  const pollIntervalMs = 500
  const maxAttempts = 120 // keep overall timeout ~60s

  while (assembly.ok !== 'ASSEMBLY_COMPLETED' && attempts < maxAttempts) {
    await new Promise((r) => setTimeout(r, pollIntervalMs))
    attempts++
    const poll = await fetch(assembly.assembly_ssl_url)
    assembly = await poll.json()

    if (assembly.error) {
      throw new Error(`Assembly failed: ${assembly.error}`)
    }
  }

  if (assembly.ok !== 'ASSEMBLY_COMPLETED') {
    throw new Error('Transloadit assembly timed out')
  }

  const results = assembly.results
  const firstStep = (Object.values(results)[0] as any[]) || []

  if (!firstStep || firstStep.length === 0) {
    const uploads = Object.values(assembly.uploads || {}).flat() as any[]
    if (uploads.length === 0) {
      throw new Error('No output files from Transloadit')
    }
    return uploads[0].ssl_url
  }

  return firstStep[0].ssl_url
}
