const stats = [
  ["Jogadores", "Criam jogos e entram em partidas abertas."],
  ["Academias", "Organizam quadras, horários, aulas e bloqueios."],
  ["Professores", "Acompanham aulas e agenda da academia."],
]

export function SocialProofSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="rounded-[2rem] bg-white p-6 shadow-sm">
        <p className="text-center text-sm font-bold uppercase tracking-[0.25em] text-zinc-400">
          Feito para todo o ecossistema da quadra
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {stats.map(([title, text]) => (
            <div
              key={title}
              className="rounded-3xl border border-zinc-100 bg-[#f8f6ef] p-6"
            >
              <h3 className="text-2xl font-black text-zinc-950">{title}</h3>
              <p className="mt-3 leading-7 text-zinc-600">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}