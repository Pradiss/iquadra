import Link from "next/link"

export function FinalCtaSection() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-7xl rounded-[2.5rem] bg-green-600 px-6 py-16 text-center text-white shadow-2xl">
        <h2 className="mx-auto max-w-3xl text-4xl font-black leading-tight md:text-5xl">
          Pronto para organizar sua rotina de quadras?
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/80">
          Comece como jogador ou cadastre sua academia para gerenciar horários,
          jogos, professores e aulas em uma única plataforma.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/cadastro"
            className="rounded-full bg-white px-7 py-4 font-bold text-green-700 hover:bg-zinc-100"
          >
            Criar conta
          </Link>

          <Link
            href="/cadastro-empresa"
            className="rounded-full border border-white/30 px-7 py-4 font-bold text-white hover:bg-white/10"
          >
            Cadastrar academia
          </Link>
        </div>
      </div>
    </section>
  )
}