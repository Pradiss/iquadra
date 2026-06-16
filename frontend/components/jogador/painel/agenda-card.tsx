"use client";

import { Plus } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TableCell, TableRow } from "@/components/ui/table";

type Participante = {
  id: string;
  nome: string;
  foto_perfil?: string | null;
  categoria?: string | null;
};

type Horario = {
  id: string;
  hora: string;
  quadraNome: string;
  motivo: "JOGO" | "AULA" | "BLOQUEADO" | null;
  capacidadeMaxima: number;
  vagasDisponiveis: number;
  jogo?: {
    participantes: Participante[];
  } | null;
};

type Props = {
  horario: Horario;
  onSelect: () => void;
};

function inicial(nome: string) {
  return nome.charAt(0).toUpperCase();
}

function status(horario: Horario) {
  if (horario.motivo === "BLOQUEADO") return "Bloqueado";
  if (horario.motivo === "AULA") return "Aula";
  if (!horario.jogo) return "Disponível";
  if (horario.vagasDisponiveis > 0) return "Amistoso";
  return "Ranking";
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
  return (
    <div className="flex min-w-0 flex-1 items-center gap-1.5">
      <div className="relative shrink-0">
        <Avatar className="h-7 w-7 bg-white">
          {jogador?.foto_perfil && (
            <AvatarImage src={jogador.foto_perfil} alt={jogador.nome} />
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

export function AgendaCard({ horario, onSelect }: Props) {
  const jogadores = horario.jogo?.participantes ?? [];

  const podeClicar =
    horario.motivo !== "AULA" &&
    horario.motivo !== "BLOQUEADO" &&
    horario.vagasDisponiveis > 0;

  return (
    <TableRow
      onClick={podeClicar ? onSelect : undefined}
      className={[
        "relative  border-b-4 border-white",
        corLinha(horario),
        podeClicar ? "cursor-pointer" : "cursor-default",
      ].join(" ")}
    >
      <TableCell className="w-[54px] bg-black/5 px-2 text-[10px] font-black text-zinc-950">
        {horario.hora}
      </TableCell>

      <TableCell className="w-[44px] bg-black/5 px-2 text-center text-[10px] font-black text-zinc-950">
        {horario.quadraNome}
      </TableCell>

      <TableCell className="px-2">
        <div className="flex w-full items-center gap-2 pr-14">
          <Jogador jogador={jogadores[0]} label="Jogador A" />

          <span className="shrink-0 text-[10px] font-black text-zinc-950">
            X
          </span>

          <Jogador jogador={jogadores[1]} label="Jogador B" />
        </div>

        
      </TableCell>
    </TableRow>
  );
}