"use client";

type AbaJogos = "pendentes" | "proximos" | "historico";

type Props = {
  aba: AbaJogos;
  onChange: (aba: AbaJogos) => void;
};

export function JogosTabs({ aba, onChange }: Props) {
  return (
    <div className="mt-6 flex gap-2 overflow-x-auto">
      <Tab active={aba === "pendentes"} onClick={() => onChange("pendentes")}>
        Pendentes
      </Tab>

      <Tab active={aba === "proximos"} onClick={() => onChange("proximos")}>
        Próximos
      </Tab>

      <Tab active={aba === "historico"} onClick={() => onChange("historico")}>
        Histórico
      </Tab>
    </div>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full px-5 py-2 text-sm font-bold transition",
        active
          ? "bg-zinc-950 text-white"
          : "bg-white text-zinc-600 hover:bg-zinc-100",
      ].join(" ")}
    >
      {children}
    </button>
  );
}