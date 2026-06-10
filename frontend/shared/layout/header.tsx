import Image from "next/image"
import Link from "next/link"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[#f4f1e8]/90 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="IQuadra"
            width={132}
            height={36}
            className="h-9 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-semibold text-zinc-700 md:flex">
          <Link href="/#jogadores">Jogadores</Link>
          <Link href="/#academias">Academias</Link>
          <Link href="/#aulas">Professores</Link>
          <Link href="/#beneficios">Beneficios</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm font-bold text-zinc-700 hover:text-zinc-950 sm:block"
          >
            Entrar
          </Link>

          <Link
            href="/cadastro"
            className="rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-zinc-800"
          >
            Criar conta
          </Link>
        </div>
      </div>
    </header>
  )
}
