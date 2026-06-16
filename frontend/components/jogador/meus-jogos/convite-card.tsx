import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Convite } from "@/lib/jogos-utils";
import { JogoInfo } from "./jogo-info";

type Props = {
  convite: Convite;
  onAceitar: () => void;
  onRecusar: () => void;
};

export function ConviteCard({ convite, onAceitar, onRecusar }: Props) {
  return (
    <div className="rounded-[28px] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <JogoInfo jogo={convite.jogo} statusLabel="Convite pendente" />

        <div className="flex gap-2">
          <Button
            onClick={onAceitar}
            className="rounded-2xl bg-green-700 font-bold text-white hover:bg-green-800"
          >
            <Check className="mr-2 h-4 w-4" />
            Aceitar
          </Button>

          <Button
            variant="outline"
            onClick={onRecusar}
            className="rounded-2xl font-bold text-red-600"
          >
            <X className="mr-2 h-4 w-4" />
            Recusar
          </Button>
        </div>
      </div>
    </div>
  );
}