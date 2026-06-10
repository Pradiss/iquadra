export function PlayerAppSection() {
  return (
    <section className="bg-zinc-950 px-6 py-20 text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
        <div className="rounded-[2rem] bg-white/10 p-6">
          <div className="rounded-[1.5rem] bg-[#f4f1e8] p-5 text-zinc-950">
            <p className="text-sm font-black text-green-700">Agenda de hoje</p>

            <div className="mt-5 space-y-3">
              {["07:00", "08:00", "18:00", "19:00"].map((time, index) => (
                <div
                  key={time}
                  className="flex items-center justify-between rounded-2xl bg-white p-4"
                >
                  <div>
                    <p className="font-black">{time}</p>
                    <p className="text-sm text-zinc-500">Quadra {index + 1}</p>
                  </div>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                    Disponível
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-black text-green-300">
            App do jogador
          </span>

          <h2 className="mt-6 text-4xl font-black leading-tight">
            Tudo que o jogador precisa para entrar em quadra.
          </h2>

          <p className="mt-5 text-lg leading-8 text-zinc-300">
            Veja seus jogos, acompanhe vagas disponíveis, entre em partidas
            abertas e organize sua rotina com mais clareza.
          </p>
        </div>
      </div>
    </section>
  )
}