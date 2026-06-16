import Link from "next/link";
import { MapPinned, ShieldCheck, Sun, Umbrella, UsersRound } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type CardQuadraProps = {
  nome: string;
  descricao?: string;
  tipoPiso: "SAIBRO" | "HARD" | "GRAMA" | "SINTETICA" | "AREIA" | "OUTRO";
  coberta: boolean;
  ativa: boolean;
  capacidadeMinima?: number;
  capacidadeMaxima?: number;
  permiteSimples?: boolean;
  permiteDupla?: boolean;
  href: string;
};

function getCapacidadeLabel({
  capacidadeMinima,
  capacidadeMaxima,
  permiteSimples,
  permiteDupla,
}: Pick<
  CardQuadraProps,
  | "capacidadeMinima"
  | "capacidadeMaxima"
  | "permiteSimples"
  | "permiteDupla"
>) {
  const aceitaSimples = permiteSimples ?? true;
  const aceitaDupla = permiteDupla ?? true;
  const minimo = capacidadeMinima ?? (aceitaSimples ? 2 : 4);
  const maximo = capacidadeMaxima ?? (aceitaDupla ? 4 : 2);

  if (aceitaSimples && aceitaDupla) return `${minimo} ou ${maximo} jogadores`;
  if (aceitaSimples) return "2 jogadores";
  if (aceitaDupla) return "4 jogadores";

  return `${maximo} jogadores`;
}

export function CardQuadra({
  nome,
  descricao,
  tipoPiso,
  coberta,
  ativa,
  capacidadeMinima,
  capacidadeMaxima,
  permiteSimples,
  permiteDupla,
  href,
}: CardQuadraProps) {
  return (
    <Card className="rounded-[30px] border-black/5 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-700">
          <MapPinned className="h-7 w-7" />
        </div>

        <Badge
          className={
            ativa
              ? "rounded-full bg-green-100 text-green-800 hover:bg-green-100"
              : "rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-100"
          }
        >
          {ativa ? "Disponível" : "Indisponível"}
        </Badge>
      </div>

      <h3 className="mt-5 text-xl font-bold tracking-[-0.02em] text-zinc-950">
        {nome}
      </h3>

      {descricao && (
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500">
          {descricao}
        </p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-zinc-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
            Piso
          </p>
          <p className="mt-1 font-bold text-zinc-950">{tipoPiso}</p>
        </div>

        <div className="rounded-2xl bg-zinc-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
            Cobertura
          </p>
          <p className="mt-1 flex items-center gap-2 font-bold text-zinc-950">
            {coberta ? (
              <Umbrella className="h-4 w-4 text-green-700" />
            ) : (
              <Sun className="h-4 w-4 text-green-700" />
            )}
            {coberta ? "Coberta" : "Aberta"}
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-2xl bg-zinc-50 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
          Capacidade
        </p>
        <p className="mt-1 flex items-center gap-2 font-bold text-zinc-950">
          <UsersRound className="h-4 w-4 text-green-700" />
          {getCapacidadeLabel({
            capacidadeMinima,
            capacidadeMaxima,
            permiteSimples,
            permiteDupla,
          })}
        </p>
      </div>

      {ativa ? (
        <Button
          asChild
          className="mt-5 h-[48px] w-full rounded-2xl bg-zinc-950 font-bold text-white hover:bg-black"
        >
          <Link href={href}>
            <ShieldCheck className="mr-2 h-4 w-4" />
            Reservar horário
          </Link>
        </Button>
      ) : (
        <Button
          disabled
          className="mt-5 h-[48px] w-full rounded-2xl bg-zinc-950 font-bold text-white opacity-50"
        >
          <ShieldCheck className="mr-2 h-4 w-4" />
          Indisponível
        </Button>
      )}
    </Card>
  );
}
