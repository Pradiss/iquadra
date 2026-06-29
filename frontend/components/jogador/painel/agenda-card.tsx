"use client";

import { Plus } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TableCell, TableRow } from "@/components/ui/table";
import { getSafeImageUrl } from "@/lib/safe-image";

type Participante = {
  id?: string;
  nome?: string;
  foto_perfil?: string | null;
  fotoUrl?: string | null;
  foto_url?: string | null;
  categoria?: string | null;
  usuario?: {
    id?: string;
    nome?: string;
    foto_perfil?: string | null;
    fotoUrl?: string | null;
    foto_url?: string | null;
    perfil_cliente?: {
      categoria?: string | null;
    } | null;
  } | null;
};

type Horario = {
  id: string;
  hora: string;
  horaFim: string;
  inicioPermitido?: string;
  quadraNome: string;
  disponivel?: boolean;
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

function getNomeParticipante(jogador?: Participante, fallback = "Jogador") {
  return jogador?.usuario?.nome || jogador?.nome || fallback;
}

function getFotoParticipante(jogador?: Participante) {
  return getSafeImageUrl(
    jogador?.usuario?.foto_perfil ||
      jogador?.usuario?.fotoUrl ||
      jogador?.usuario?.foto_url ||
      jogador?.foto_perfil ||
      jogador?.fotoUrl ||
      jogador?.foto_url ||
      null,
  );
}

function getCategoriaParticipante(jogador?: Participante) {
  return (
    jogador?.usuario?.perfil_cliente?.categoria ||
    jogador?.categoria ||
    null
  );
}

function corLinha(horario: Horario) {
  if (horario.motivo === "AULA" || horario.motivo === "BLOQUEADO") {
    return "bg-zinc-300";
  }

  if (!horario.jogo) {
    return horario.disponivel ? "bg-[#D4D4D8]" : "bg-zinc-300";
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
    return horario.disponivel ? "bg-[#C7C7D0]" : "bg-[#C7C7CF]";
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
  const nome = getNomeParticipante(jogador, label);
  const fotoPerfil = getFotoParticipante(jogador);
  const categoria = inicialCategoria(getCategoriaParticipante(jogador));

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <div className="relative shrink-0">
        <Avatar className="h-9 w-9 bg-white">
          {fotoPerfil ? <AvatarImage src={fotoPerfil} alt={nome} /> : null}

          <AvatarFallback className="bg-white text-[13px] font-black text-zinc-800">
            {jogador ? inicial(nome) : <Plus className="h-3.5 w-3.5" />}
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
          {nome}
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

  const subtituloLivre =
    horario.inicioPermitido && horario.inicioPermitido !== horario.hora
      ? `Disponível a partir de ${horario.inicioPermitido}`
      : "Disponível para reserva";

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

      <TableCell className={["rounded-r-2xl px-2", corLinha(horario)].join(" ")}>
        {!horario.jogo ? (
          <div className="flex min-h-12 items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[12.5px] font-black text-zinc-950">
                {horario.disponivel ? "Horário livre" : "Indisponível"}
              </p>

              <p className="truncate text-[11px] font-semibold text-zinc-700">
                {horario.disponivel ? subtituloLivre : "Sem reserva"}
              </p>
            </div>

            {horario.disponivel && (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/80 text-zinc-900">
                <Plus className="h-4 w-4" />
              </span>
            )}
          </div>
        ) : (
          <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2">
            <Jogador jogador={jogadoresSlots[0]} label="Jogador 1" />

            <span className="text-xs font-black text-zinc-950">X</span>

            <Jogador jogador={jogadoresSlots[1]} label="Jogador 2" />

            {jogadoresSlots.length > 2 && (
              <>
                <Jogador jogador={jogadoresSlots[2]} label="Jogador 3" />

                <span className="text-xs font-medium text-zinc-950">X</span>

                <Jogador jogador={jogadoresSlots[3]} label="Jogador 4" />
              </>
            )}
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}
