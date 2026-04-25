import { redirect } from 'next/navigation'

const LEARNING_URL = process.env.NEXT_PUBLIC_LEARNING_URL || 'http://localhost:3003'

export default function MyCoursesRedirectPage() {
  redirect(LEARNING_URL)
}
