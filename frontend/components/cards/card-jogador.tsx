import { MapPin, UserPlus, Eye } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type CardJogadorProps = {
  nome: string;
  email?: string;
  cidade?: string;
  categoria?: "A" | "B" | "C" | "D" | "INICIANTE";
  status?: "ATIVO" | "INATIVO" | "BLOQUEADO";
  onVerPerfil?: () => void;
  onAdicionarAmigo?: () => void;
};

function getInitials(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");
}

function getCategoriaLabel(categoria?: string) {
  if (!categoria) return "Sem categoria";
  return categoria === "INICIANTE" ? "Iniciante" : categoria;
}

export function CardJogador({
  nome,
  email,
  cidade,
  categoria,
  status = "ATIVO",
  onVerPerfil,
  onAdicionarAmigo,
}: CardJogadorProps) {
  return (
    <Card className="rounded-[30px] border-black/5 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-green-100 text-base font-black text-green-800">
              {getInitials(nome)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold text-zinc-950">{nome}</h3>
            {email && <p className="truncate text-sm text-zinc-500">{email}</p>}
          </div>
        </div>

        <Badge className="rounded-full bg-green-100 text-green-800 hover:bg-green-100">
          {status === "ATIVO" ? "Ativo" : status}
        </Badge>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Badge variant="outline" className="rounded-full">
          Categoria {getCategoriaLabel(categoria)}
        </Badge>

        {cidade && (
          <Badge variant="outline" className="rounded-full">
            <MapPin className="mr-1 h-3 w-3" />
            {cidade}
          </Badge>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onVerPerfil}
          className="h-[46px] rounded-2xl font-bold"
        >
          <Eye className="mr-2 h-4 w-4" />
          Perfil
        </Button>

        <Button
          type="button"
          onClick={onAdicionarAmigo}
          className="h-[46px] rounded-2xl bg-zinc-950 font-bold text-white hover:bg-black"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Amigo
        </Button>
      </div>
    </Card>
  );
}