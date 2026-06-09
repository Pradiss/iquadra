import { PainelHeader } from "../../components/painel/header"
import { PainelSidebar } from "../../components/painel/sidebar"
import { PainelBottomNav } from "../../components/painel/bottom-nav"

export default function PainelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-[#f4f1e8] text-zinc-950">
      <PainelHeader />

      <div className="mx-auto flex w-full  gap-6 px-4 py-5 pb-24 sm:px-6 lg:px-8 lg:pb-8">
        <PainelSidebar />

        <section className="min-w-0 flex-1">{children}</section>
      </div>

      <PainelBottomNav />
    </main>
  )
}