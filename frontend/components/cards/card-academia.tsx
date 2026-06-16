import Link from "next/link";
import { Building2, MapPin, Phone, Mail, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type CardAcademiaProps = {
  nome: string;
  cidade?: string;
  estado?: string;
  telefone?: string;
  email?: string;
  quantidadeQuadras?: number;
  status?: "ATIVO" | "INATIVO" | "BLOQUEADO";
  href: string;
};

export function CardAcademia({
  nome,
  cidade,
  estado,
  telefone,
  email,
  quantidadeQuadras = 0,
  status = "ATIVO",
  href,
}: CardAcademiaProps) {
  return (
    <Card className="overflow-hidden rounded-[30px] border-black/5 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="relative h-36 bg-gradient-to-br from-green-800 via-green-500 to-lime-300 p-5">
        <div className="flex items-center justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/95 text-green-700 shadow-sm">
            <Building2 className="h-7 w-7" />
          </div>

          <Badge className="rounded-full bg-white/90 text-green-800 hover:bg-white">
            {status === "ATIVO" ? "Ativa" : status}
          </Badge>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold tracking-[-0.02em] text-zinc-950">
          {nome}
        </h3>

        <div className="mt-3 space-y-2 text-sm text-zinc-500">
          {(cidade || estado) && (
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-700" />
              {cidade} {estado && `- ${estado}`}
            </p>
          )}

          {telefone && (
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-green-700" />
              {telefone}
            </p>
          )}

          {email && (
            <p className="flex items-center gap-2 truncate">
              <Mail className="h-4 w-4 text-green-700" />
              {email}
            </p>
          )}
        </div>

        <div className="mt-5 rounded-2xl bg-zinc-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
            Quadras disponíveis
          </p>
          <p className="mt-1 text-2xl font-black text-zinc-950">
            {quantidadeQuadras}
          </p>
        </div>

        <Button
          asChild
          className="mt-5 h-[48px] w-full rounded-2xl bg-zinc-950 font-bold text-white hover:bg-black"
        >
          <Link href={href}>
            Ver detalhes
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}