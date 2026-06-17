"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { PainelLoading } from "@/components/painel/guards/painel-loading";
import { validateSession } from "@/lib/auth-session";
import { getPainelHomeByRole } from "@/lib/user-role";

export default function ConfiguracoesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function redirectByRole() {
      const session = await validateSession();

      if (!mounted) return;

      if (!session) {
        router.replace("/login");
        return;
      }

      if (session.role === "jogador") {
        router.replace("/painel/jogador/configuracoes");
        return;
      }

      router.replace(getPainelHomeByRole(session.role));
    }

    void redirectByRole();

    return () => {
      mounted = false;
    };
  }, [router]);

  return <PainelLoading />;
}
