import Link from "next/link"

const items = [
  "Horários livres e ocupados",
  "Quadras por academia",
  "Bloqueios e aulas na mesma agenda",
  "Criação de jogos em poucos cliques",
]

export function CourtReservationSection() {
  return (
    <section id="jogadores" className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-2">
      <div>
        <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-black text-green-700">
          Para jogadores
        </span>

        <h2 className="mt-6 text-4xl font-black leading-tight text-zinc-950">
          Encontre uma quadra e marque seu jogo sem depender de mensagem.
        </h2>

        <p className="mt-5 text-lg leading-8 text-zinc-600">
          O jogador escolhe a academia, visualiza os horários disponíveis e cria
          jogos simples ou em dupla direto pela agenda.
        </p>

        <Link
          href="/cadastro"
          className="mt-8 inline-flex rounded-full bg-zinc-950 px-7 py-4 font-bold text-white hover:bg-zinc-800"
        >
          Criar conta de jogador
        </Link>
      </div>

      <div className="rounded-[2rem] bg-white p-6 shadow-xl">
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item} className="flex items-center gap-4 rounded-2xl bg-[#f8f6ef] p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 font-black text-white">
                {index + 1}
              </span>
              <p className="font-bold text-zinc-800">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}