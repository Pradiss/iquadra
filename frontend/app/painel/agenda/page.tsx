import { Suspense } from "react"
import { AgendaBoard } from "@/features/painel/components"

export const dynamic = "force-dynamic"

export default function AgendaPage() {
  return (
    <Suspense fallback={<div>Carregando agenda...</div>}>
      <AgendaBoard />
    </Suspense>
  )
}
