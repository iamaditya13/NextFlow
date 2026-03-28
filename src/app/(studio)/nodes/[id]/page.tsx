import { redirect } from 'next/navigation'

export default async function NodeEditorByIdPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/dashboard/node-editor/${id}`)
}
