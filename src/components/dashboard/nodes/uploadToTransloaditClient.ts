/**
 * Upload a file to Transloadit using a server-generated signature.
 * 1. Gets a signed params/signature from our API
 * 2. Uploads directly to Transloadit
 * 3. Polls until assembly completes
 */
export async function uploadFileToTransloadit(
  file: File,
  uploadType: 'image' | 'video',
  onProgress?: (pct: number) => void
): Promise<string> {
  // 1. Get signature from server
  const sigRes = await fetch('/api/upload/signature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uploadType }),
  })

  const sigJson = await sigRes.json()
  if (!sigJson.success || !sigJson.data) {
    throw new Error(sigJson.error || 'Failed to get upload signature')
  }

  const { params, signature } = sigJson.data

  // 2. Upload to Transloadit
  const formData = new FormData()
  formData.append('params', params)
  formData.append('signature', signature)
  formData.append('file', file)

  onProgress?.(10)

  const response = await fetch('https://api2.transloadit.com/assemblies', {
    method: 'POST',
    body: formData,
  })

  const json = await response.json()
  if (json.error) {
    throw new Error(`Transloadit error: ${json.error}`)
  }

  onProgress?.(40)

  // 3. Poll until complete
  let assembly = json
  for (let attempt = 0; attempt < 60; attempt++) {
    if (assembly.ok === 'ASSEMBLY_COMPLETED') {
      onProgress?.(100)

      const firstResult = Object.values(assembly.results || {})[0] as
        | Array<{ ssl_url: string }>
        | undefined

      if (firstResult && firstResult.length > 0) {
        return firstResult[0].ssl_url
      }

      const uploads = Object.values(assembly.uploads || {}).flat() as Array<{
        ssl_url: string
      }>
      if (uploads.length > 0) {
        return uploads[0].ssl_url
      }

      throw new Error('Transloadit completed without output files')
    }

    if (assembly.error) {
      throw new Error(`Transloadit assembly failed: ${assembly.error}`)
    }

    onProgress?.(40 + Math.min(attempt * 2, 50))
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const pollResponse = await fetch(assembly.assembly_ssl_url)
    assembly = await pollResponse.json()
  }

  throw new Error('Transloadit upload timed out')
}
