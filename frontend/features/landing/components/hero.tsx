import Image from "next/image"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#c7f9cc_0,transparent_32%),radial-gradient(circle_at_bottom_right,#d9f99d_0,transparent_28%)]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
        <div>
          <span className="inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-black text-green-700">
            Onde o jogo começa
          </span>

          <h1 className="mt-6 max-w-2xl text-5xl font-black leading-tight tracking-tight text-zinc-950 md:text-6xl">
            Reserve quadras, entre em jogos e organize sua rotina no tênis.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600">
            O IQuadra conecta jogadores, professores e academias em uma agenda
            simples para marcar jogos, aulas e horários de quadra.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/cadastro"
              className="rounded-full bg-zinc-950 px-7 py-4 text-center font-bold text-white transition hover:bg-zinc-800"
            >
              Começar como jogador
            </Link>

            <Link
              href="/cadastro-empresa"
              className="rounded-full border border-zinc-300 bg-white px-7 py-4 text-center font-bold text-zinc-800 transition hover:bg-zinc-50"
            >
              Cadastrar academia
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-[2rem] bg-white p-4 shadow-2xl">
            <Image
              src="/logo.png"
              alt="Quadra de tênis"
              width={720}
              height={620}
              className="h-[520px] w-full rounded-[1.5rem] object-cover"
              priority
            />
          </div>

          <div className="absolute -bottom-6 -left-4 rounded-3xl bg-white p-5 shadow-xl">
            <p className="text-sm font-bold text-zinc-500">Próximo horário</p>
            <p className="mt-1 text-3xl font-black text-zinc-950">18:00</p>
            <p className="text-sm font-semibold text-green-600">
              Quadra disponível
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}