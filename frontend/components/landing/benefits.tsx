const benefits = [
  {
    title: "Sem conflito de horário",
    text: "Jogos, aulas e bloqueios respeitam a mesma agenda.",
  },
  {
    title: "Multiacademia",
    text: "Um jogador pode participar de várias academias com a mesma conta.",
  },
  {
    title: "Perfis por empresa",
    text: "O mesmo usuário pode ser jogador, professor ou administrador.",
  },
  {
    title: "Gestão simples",
    text: "Academias configuram quadras, horários, clientes e aulas.",
  },
]

export function BenefitsSection() {
  return (
    <section id="beneficios" className="mx-auto max-w-7xl px-6 py-20">
      <div className="max-w-2xl">
        <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-black text-green-700">
          Benefícios
        </span>

        <h2 className="mt-6 text-4xl font-black leading-tight text-zinc-950">
          Uma estrutura feita para crescer com sua operação.
        </h2>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {benefits.map((item) => (
          <div key={item.title} className="rounded-[2rem] bg-white p-6 shadow-sm">
            <h3 className="text-xl font-black text-zinc-950">{item.title}</h3>
            <p className="mt-3 leading-7 text-zinc-600">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}