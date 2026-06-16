import { CalendarDays, Clock, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Jogo } from "@/lib/jogos-utils";
import {
  formatDataJogo,
  formatHorarioJogo,
  formatStatus,
} from "@/lib/jogos-utils";

type Props = {
  jogo?: Jogo;
  statusLabel?: string;
};

function getStatusClass(status?: string, statusLabel?: string) {
  const value = statusLabel ?? formatStatus(status);

  if (value === "Pendente") {
    return "bg-blue-100 text-blue-800 hover:bg-blue-100";
  }

  if (value === "Cancelado") {
    return "bg-red-100 text-red-800 hover:bg-red-100";
  }

  if (
    value === "Completo" ||
    value === "Concluido" ||
    value === "Próximo jogo"
  ) {
    return "bg-green-100 text-green-800 hover:bg-green-100";
  }

  return "bg-zinc-100 text-zinc-700";
}

export function JogoInfo({ jogo, statusLabel }: Props) {
  const academia = jogo?.academia ?? jogo?.quadra?.academia;

  const jogadores =
    jogo?.participantes
      ?.map((participante) => participante.usuario?.nome)
      .filter(Boolean)
      .join(" x ") || "Jogadores não definidos";

  return (
    <div>
      <Badge
        className={`rounded-full ${getStatusClass(jogo?.status, statusLabel)}`}
      >
        {statusLabel ?? formatStatus(jogo?.status)}
      </Badge>

      <h3 className="mt-3 text-lg font-black text-zinc-950">
        {jogo?.quadra?.nome ?? "Quadra"}
      </h3>

      <p className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
        <MapPin className="h-4 w-4 text-green-700" />
        {academia?.nome ?? "Academia"}
        {academia?.cidade && ` - ${academia.cidade}`}
      </p>

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-zinc-600">
        <span className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-green-700" />
          {formatDataJogo(jogo)}
        </span>

        <span className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-green-700" />
          {formatHorarioJogo(jogo)}
        </span>
      </div>

      <p className="mt-3 text-sm font-semibold text-zinc-700">{jogadores}</p>
    </div>
  );
}
