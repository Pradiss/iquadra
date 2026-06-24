"use client";

import { Plus } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TableCell, TableRow } from "@/components/ui/table";
import { getSafeImageUrl } from "@/lib/safe-image";

type Participante = {
  id?: string;
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

function inicialCategoria(categoria?: string | null) {
  if (!categoria) return "";

  return categoria.charAt(0).toUpperCase();
}

function corLinha(horario: Horario) {
  if (horario.motivo === "AULA" || horario.motivo === "BLOQUEADO") {
    return "bg-zinc-300";
  }

  if (!horario.jogo) {
    return "bg-zinc-300";
  }

  if (horario.vagasDisponiveis > 0) {
    return "bg-[#71A8E8]";
  }

  return "bg-[#A4DD9F]";
}

function corHorario(horario: Horario) {
  if (horario.motivo === "AULA" || horario.motivo === "BLOQUEADO") {
    return "bg-[#C7C7CF]";
  }

  if (!horario.jogo) {
    return "bg-[#C7C7CF]";
  }

  if (horario.vagasDisponiveis > 0) {
    return "bg-[#5C98DC]";
  }

  return "bg-[#8DCE87]";
}

function Jogador({
  jogador,
  label,
}: {
  jogador?: Participante;
  label: string;
}) {
  const fotoPerfil = getSafeImageUrl(jogador?.foto_perfil);
  const categoria = inicialCategoria(jogador?.categoria);

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <div className="relative shrink-0">
        <Avatar className="h-9 w-9 bg-white">
          {fotoPerfil && (
            <AvatarImage src={fotoPerfil} alt={jogador?.nome ?? label} />
          )}

          <AvatarFallback className="bg-white text-[13px] font-black text-zinc-800">
            {jogador ? inicial(jogador.nome) : <Plus className="h-3.5 w-3.5" />}
          </AvatarFallback>
        </Avatar>

        {categoria && (
          <span className="absolute -bottom-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-white px-1 text-[8px] font-black text-zinc-900">
            {categoria}
          </span>
        )}
      </div>

      <div className="min-w-0">
        <p className="truncate text-[12.5px] font-bold text-zinc-950">
          {jogador?.nome ?? label}
        </p>
      </div>
    </div>
  );
}

export function AgendaCard({ horario, canSelect = false, onSelect }: Props) {
  const jogadores = horario.jogo?.participantes ?? [];
  const totalJogadores = Math.min(Math.max(jogadores.length, 2), 4);
  const jogadoresSlots = Array.from(
    { length: totalJogadores },
    (_, index) => jogadores[index],
  );

  return (
    <TableRow
  onClick={canSelect ? onSelect : undefined}
  className={canSelect ? "cursor-pointer" : "cursor-default"}
>
      <TableCell
        className={[
          "w-[20px] rounded-l-[14px] bg-black/5 px-2 text-zinc-950",
          corHorario(horario),
        ].join(" ")}
      >
        <div className="grid gap-0.5 leading-none">
          <span className="text-[12px] font-bold">{horario.hora}</span>
          <span className="text-[11px] font-medium text-zinc-700">
            até {horario.horaFim}
          </span>
        </div>
      </TableCell>

      <TableCell
        className={[
          "w-[30px] px-2 text-center text-[10px] font-bold text-zinc-950",
          corLinha(horario),
        ].join(" ")}
      >
        {horario.quadraNome}
      </TableCell>

      <TableCell
        className={["rounded-r-2xl px-2", corLinha(horario)].join(" ")}
      >
        <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2">
          <Jogador jogador={jogadoresSlots[0]} label="Jogador 1" />

          <span className="text-xs font-black text-zinc-950">X</span>

          <Jogador jogador={jogadoresSlots[1]} label="Jogador 2" />

          {jogadoresSlots.length > 2 && (
            <>
              <Jogador jogador={jogadoresSlots[2]} label="Jogador 3" />

              <span className="text-xs font-medium text-zinc-950 ">X</span>

              <Jogador jogador={jogadoresSlots[3]} label="Jogador 4" />
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
