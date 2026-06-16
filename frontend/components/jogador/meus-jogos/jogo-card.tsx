import type { Jogo } from "@/lib/jogos-utils";
import { JogoInfo } from "./jogo-info";

type Props = {
  jogo: Jogo;
  action?: React.ReactNode;
};

export function JogoCard({ jogo, action }: Props) {
  return (
    <div className="rounded-[28px]  bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <JogoInfo jogo={jogo} />
        {action}
      </div>
    </div>
  );
}