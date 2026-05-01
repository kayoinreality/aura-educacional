import { Suspense } from 'react'
import { HandoffClient } from './handoff-client'

export const dynamic = 'force-dynamic'

export default function HandoffPage() {
  return (
    <Suspense fallback={null}>
      <HandoffClient />
    </Suspense>
  )
}
