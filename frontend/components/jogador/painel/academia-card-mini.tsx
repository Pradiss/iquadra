
"use client";

import { MapPin, Building2} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

type Props = {
  nome: string;
  cidade?: string;
  selected?: boolean;
  fotoUrl?: string;
  onClick?: () => void;
};

export function AcademiaCardMini({ nome, cidade, selected, fotoUrl, onClick }: Props) {
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
      <div className="">
        {fotoUrl ? (
          <Image
            src={fotoUrl}
            alt={nome}
            width={120}
            height={32}
            className="h-8"
          />
        ) : (
         <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
        <Building2 className="h-5 w-5 text-green-700" />
      </div>
        )}
        
        
      </div>

      <div className="text-left">
        <p className="font-bold">{nome}</p>

        <p className="flex items-center gap-1 text-xs text-zinc-500">
          <MapPin className="h-3 w-3" />
          {cidade} 
        </p>
      </div>
    </Button>
  );
}
