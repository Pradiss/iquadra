"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { getToken, getUsuario } from "@/lib/auth-storage";
import { PainelHeader } from "./header";
import { PainelSidebar } from "./sidebar";
import { PainelBottomNav } from "./bottom-nav";
import { LogoutButton } from "./logoutButton";
import { isPainelLinkActive, painelJogadorNavItems } from "./nav-items";


export function LayoutPainel({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = getToken();
    const usuario = getUsuario();

    if (!token || !usuario) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f4f1e8]">
      <PainelHeader onOpenMenu={() => setMenuOpen(true)} />

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="left"
          className="w-[320px] border-r border-black/5 bg-[#f4f1e8] p-0"
        >
          <SheetHeader className="border-b border-black/5 px-5 py-5">
            <SheetTitle className="text-left text-base font-bold">
              <Link href="/painel/jogador" className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="IQuadra"
                  width={120}
                  height={32}
                  className="h-8"
                  style={{ width: "auto" }}
                />
              </Link>
            </SheetTitle>
          </SheetHeader>

          <nav className="space-y-2 px-4 py-5">
            {painelJogadorNavItems.map((item) => {
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
        <PainelSidebar />

        <main className="min-w-0 flex-1 px-4 py-6 pb-28 sm:px-6 lg:ml-[300px] lg:px-12 lg:py-8">
          {children}
         
        </main>
      </div>

      <PainelBottomNav />
    </div>
  );
}
