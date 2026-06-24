"use client";

import { Building2, MapPin } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getSafeImageUrl } from "@/lib/safe-image";

type Props = {
  nome: string;
  cidade?: string;
  selected?: boolean;
  fotoUrl?: string | null;
  onClick?: () => void;
};

export function AcademiaCardMini({
  nome,
  cidade,
  selected,
  fotoUrl,
  onClick,
}: Props) {
  const foto = getSafeImageUrl(fotoUrl);

  return (
    <Button
      type="button"
      onClick={onClick}
      variant="outline"
      className={[
        "h-auto justify-start gap-3 rounded-2xl p-3",
        selected ? "border-green-500 bg-green-50" : "bg-white",
      ].join(" ")}
    >
      <Avatar className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-green-100">
        {foto && (
          <AvatarImage
            src={foto}
            alt={nome}
            className="h-full w-full object-cover"
          />
        )}

        <AvatarFallback className="rounded-xl bg-green-100 text-green-700">
          <Building2 className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 text-left">
        <p className="truncate font-bold">{nome}</p>

        <p className="flex items-center gap-1 text-xs text-zinc-500">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{cidade || "Local não informado"}</span>
        </p>
      </div>
    </Button>
  );
}
