"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import type { UsuarioLogado } from "@/lib/auth-storage";
import { PainelHeader } from "./header";
import { PainelSidebar } from "./sidebar";
// import { PainelBottomNav } from "./bottom-nav";
import { LogoutButton } from "./logoutButton";
import {
  isPainelLinkActive,
  painelAdminNavItems,
  painelJogadorNavItems,
} from "./nav-items";

export type LayoutPainelRole = "admin" | "jogador";

function getHomeHref(role: LayoutPainelRole) {
  return role === "admin" ? "/painel/admin" : "/painel/jogador";
}

export function LayoutPainel({
  children,
  role,
  usuario,
}: {
  children: ReactNode;
  role: LayoutPainelRole;
  usuario: UsuarioLogado;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems =
    role === "admin" ? painelAdminNavItems : painelJogadorNavItems;

  return (
    <div className="min-h-screen bg-[#f4f1e8]">
      <PainelHeader
        role={role}
        usuario={usuario}
        onOpenMenu={() => setMenuOpen(true)}
      />

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="left"
          className="w-[320px] border-r border-black/5 bg-[#f4f1e8] p-0"
        >
          <SheetHeader className="border-b border-black/5 px-5 py-5">
            <SheetTitle className="text-left text-base font-bold">
              <Link href={getHomeHref(role)} className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="IQuadra"
                  width={120}
                  height={32}
                  className="h-20"
                  style={{ width: "auto" }}
                />
              </Link>
            </SheetTitle>
          </SheetHeader>

          <nav className="space-y-2 px-4 py-5">
            {navItems.map((item) => {
              const active = isPainelLinkActive(pathname, item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={[
                    "flex h-12 items-center gap-3 rounded-2xl px-3 text-sm font-bold transition",
                    active
                      ? "bg-gray-900 text-white"
                      : "text-zinc-600 hover:bg-white",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-9 w-9 items-center justify-center rounded-xl",
                      active ? "bg-white/15" : "bg-white",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4" />
                  </span>

                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-5 left-4 right-4">
            <LogoutButton />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex">
        <PainelSidebar role={role} />

        <main className="min-w-0 flex-1 px-4 py-6 pb-28 sm:px-6 lg:ml-[300px] lg:px-12 lg:py-8">
          {children}
        </main>
      </div>

      {/* <PainelBottomNav role={role} /> */}
    </div>
  );
}
