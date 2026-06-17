"use client";

import { Plus } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TableCell, TableRow } from "@/components/ui/table";
import { getSafeImageUrl } from "@/lib/safe-image";

type Participante = {
  id: string;
  nome: string;
  foto_perfil?: string | null;
  categoria?: string | null;
};

type Horario = {
  id: string;
  hora: string;
  horaFim: string;
  quadraNome: string;
  motivo: "JOGO" | "AULA" | "BLOQUEADO" | null;
  capacidadeMaxima: number;
  vagasDisponiveis: number;
  jogo?: {
    maximo_participantes?: number;
    participantes: Participante[];
  } | null;
};

type Props = {
  horario: Horario;
  canSelect?: boolean;
  onSelect: () => void;
};

function inicial(nome: string) {
  return nome.charAt(0).toUpperCase();
}

function corLinha(horario: Horario) {
  if (horario.motivo === "AULA" || horario.motivo === "BLOQUEADO") {
    return "bg-zinc-300 hover:bg-zinc-300";
  }

  if (!horario.jogo) {
    return "bg-zinc-300 hover:bg-zinc-300";
  }

  if (horario.vagasDisponiveis > 0) {
    return "bg-blue-300 hover:bg-blue-300";
  }

  return "bg-green-300 hover:bg-green-300";
}

function Jogador({ jogador, label }: { jogador?: Participante; label: string }) {
  const fotoPerfil = getSafeImageUrl(jogador?.foto_perfil);

  return (
    <div className="flex min-w-0 flex-1 items-center gap-1.5">
      <div className="relative shrink-0">
        <Avatar className="h-7 w-7 bg-white">
          {fotoPerfil && (
            <AvatarImage src={fotoPerfil} alt={jogador?.nome ?? label} />
          )}

          <AvatarFallback className="bg-white text-[10px] font-black text-zinc-800">
            {jogador ? inicial(jogador.nome) : <Plus className="h-3.5 w-3.5" />}
          </AvatarFallback>
        </Avatar>

        {jogador?.categoria && (
          <span className="absolute -bottom-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-white px-1 text-[8px] font-black text-zinc-900">
            {jogador.categoria}
          </span>
        )}
      </div>

      <div className="min-w-0">
        <p className="truncate text-[10px] font-black text-zinc-950">
          {jogador?.nome ?? label}
        </p>
        <p className="truncate text-[8px] font-bold text-zinc-700">
          {jogador?.categoria ?? "Livre"}
        </p>
      </div>
    </div>
  );
}

export function AgendaCard({ horario, canSelect = false, onSelect }: Props) {
  const jogadores = horario.jogo?.participantes ?? [];
  const totalJogadores = Math.max(
    Math.min(horario.jogo?.maximo_participantes ?? horario.capacidadeMaxima, 4),
    2,
  );
  const jogadoresSlots = Array.from(
    { length: totalJogadores },
    (_, index) => jogadores[index],
  );

  return (
    <TableRow
      onClick={canSelect ? onSelect : undefined}
      className={[
        "relative border-b-4 rounded-[20px] border-white",
        corLinha(horario),
        canSelect ? "cursor-pointer" : "cursor-default",
      ].join(" ")}
    >
      <TableCell className="w-[55px] bg-black/5 px-2 text-zinc-950">
        <div className="grid gap-0.5 leading-none">
          <span className="text-[10px] font-black">{horario.hora}</span>
          <span className="text-[8px] font-bold text-zinc-700">
            até {horario.horaFim}
          </span>
        </div>
      </TableCell>

      <TableCell className="w-[34px] bg-green px-2 text-center text-[10px] font-black text-zinc-950">
        {horario.quadraNome}
      </TableCell>

      <TableCell className="px-2">
        <div className="grid w-full grid-cols-2 gap-2">
          {jogadoresSlots.map((jogador, index) => (
            <Jogador
              key={`${horario.id}-jogador-${index}`}
              jogador={jogador}
              label={`Jogador ${index + 1}`}
            />
          ))}
        </div>
      </TableCell>
    </TableRow>
  );
}
