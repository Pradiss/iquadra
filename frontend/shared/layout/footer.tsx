import Image from "next/image"
import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 bg-zinc-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <Image
            src="/logo.png"
            alt="IQuadra"
            width={132}
            height={36}
            className="h-9 w-auto brightness-0 invert"
          />

          <p className="mt-5 max-w-sm text-sm leading-7 text-zinc-400">
            Plataforma para jogadores, professores e academias organizarem
            quadras, horários, jogos e aulas em um só lugar.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold">Produto</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-zinc-400">
            <a href="#jogadores">Jogadores</a>
            <a href="#academias">Academias</a>
            <a href="#aulas">Professores</a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold">Acesso</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-zinc-400">
            <Link href="/login">Entrar</Link>
            <Link href="/cadastro">Cadastro jogador</Link>
            <Link href="/cadastro-empresa">Cadastrar academia</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-5 text-center text-xs text-zinc-500">
        © 2026 IQuadra. Todos os direitos reservados.
      </div>
    </footer>
  )
}