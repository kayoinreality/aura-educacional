import { redirect } from 'next/navigation'

const LEARNING_URL = process.env.NEXT_PUBLIC_LEARNING_URL || 'http://127.0.0.1:3003'

export default function AssessmentRedirectPage({ params }: { params: { slug: string } }) {
  redirect(`${LEARNING_URL}/cursos/${params.slug}/avaliacao`)
}
