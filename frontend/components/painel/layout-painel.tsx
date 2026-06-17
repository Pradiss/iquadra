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

import api from "@/services/api";
import { clearAuthStorage, getToken } from "@/lib/auth-storage";
import { getUserRole } from "@/lib/user-role";
import { PainelHeader } from "./header";
import { PainelSidebar } from "./sidebar";
import { PainelBottomNav } from "./bottom-nav";
import { LogoutButton } from "./logoutButton";
import {
  isPainelLinkActive,
  painelAdminNavItems,
  painelJogadorNavItems,
} from "./nav-items";

function getData<T>(response: { data: unknown }): T {
  const data = response.data as { data?: T; user?: T };
  return data.data ?? data.user ?? (response.data as T);
}

type PainelRole = ReturnType<typeof getUserRole>;

function getHomeHref(role: PainelRole) {
  return role === "admin" ? "/painel/admin" : "/painel/jogador";
}

function getRedirectPath(pathname: string, role: PainelRole) {
  if (role === "admin") {
    if (pathname.startsWith("/painel/jogador")) return "/painel/admin";
    if (pathname === "/painel/configuracoes") {
      return "/painel/admin/configuracoes";
    }
  }

  if (role === "jogador" && pathname.startsWith("/painel/admin")) {
    return "/painel/jogador";
  }

  return null;
}

export function LayoutPainel({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [role, setRole] = useState<PainelRole>(null);

  useEffect(() => {
    let mounted = true;

    async function validateSession() {
      const token = getToken();

      if (!token) {
        clearAuthStorage();
        router.replace("/login");
        return;
      }

      try {
        const response = await api.get("/users/me");
        const usuario = getData<Parameters<typeof getUserRole>[0]>(response);
        localStorage.setItem("usuario", JSON.stringify(usuario));

        const usuarioRole = getUserRole(usuario);
        const redirectPath = getRedirectPath(pathname, usuarioRole);

        if (redirectPath) {
          router.replace(redirectPath);
          return;
        }

        if (mounted) {
          setRole(usuarioRole);
          setCheckingAuth(false);
        }
      } catch {
        clearAuthStorage();
        router.replace("/login");
      }
    }

    void validateSession();

    return () => {
      mounted = false;
    };
  }, [pathname, router]);

 

  const navItems =
    role === "admin" ? painelAdminNavItems : painelJogadorNavItems;

  return (
    <div className="min-h-screen bg-[#f4f1e8]">
      <PainelHeader role={role} onOpenMenu={() => setMenuOpen(true)} />

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
                  className="h-8"
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

      <PainelBottomNav role={role} />
    </div>
  );
}
