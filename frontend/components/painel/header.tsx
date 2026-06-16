"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getUsuario, type UsuarioLogado } from "@/lib/auth-storage";

type PainelHeaderProps = {
  onOpenMenu: () => void;
};

function getInitials(nome?: string) {
  if (!nome) return "IQ";

  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");
}

function getFirstName(nome?: string) {
  return nome?.trim().split(" ")[0] || "Jogador";
}

export function PainelHeader({ onOpenMenu }: PainelHeaderProps) {
  const [usuario] = useState<UsuarioLogado | null>(() => getUsuario());

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-[#f4f1e8]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 items-center justify-between gap-3 px-4 sm:h-20 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={onOpenMenu}
            className=" lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/painel/jogador" className="hidden lg:flex items-center">
            <Image
              src="/logo.png"
              alt="IQuadra"
              width={120}
              height={32}
              className="h-8"
              style={{ width: "auto" }}
            />
          </Link>
         
        </div>
        <div>
           <Link href="/painel/jogador" className="flex lg:hidden items-center">
            <Image
              src="/logo.png"
              alt="IQuadra"
              width={120}
              height={32}
              className="h-8"
              style={{ width: "auto" }}
            />
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-bold text-zinc-900">
              Olá, {getFirstName(usuario?.nome)}
            </p>
            <p className="text-xs font-semibold text-green-700">
              Painel do jogador
            </p>
          </div>

          <Avatar className="h-10 w-10 bg-green-100 text-green-800">
            <AvatarFallback className="bg-green-100 font-black text-green-800">
              {getInitials(usuario?.nome)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
