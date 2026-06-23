"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

import {
  validateSession,
  type ValidatedSession,
} from "@/lib/auth-session";
import {
  getPainelHomeByRole,
  type PainelRole,
} from "@/lib/user-role";
import {
  LayoutPainel,
  type LayoutPainelRole,
} from "@/components/painel/layout-painel";
import { PainelLoading } from "./painel-loading";

type PainelRoleGuardProps = {
  children: ReactNode;
  expectedRole: LayoutPainelRole;
};

export function PainelRoleGuard({
  children,
  expectedRole,
}: PainelRoleGuardProps) {
  const router = useRouter();
  const [session, setSession] = useState<ValidatedSession | null>(null);

  useEffect(() => {
    let mounted = true;

    async function validar() {
      const validatedSession = await validateSession();

      if (!mounted) return;

      if (!validatedSession) {
        router.replace(getLoginRedirectUrl());
        return;
      }

      if (validatedSession.role !== expectedRole) {
        router.replace(getPainelHomeByRole(validatedSession.role));
        return;
      }

      setSession(validatedSession);
    }

    void validar();

    return () => {
      mounted = false;
    };
  }, [expectedRole, router]);

  if (!session) {
    return <PainelLoading />;
  }

  return (
    <LayoutPainel role={expectedRole} usuario={session.usuario}>
      {children}
    </LayoutPainel>
  );
}

type ProfessorGuardProps = {
  children: ReactNode;
};

export function ProfessorGuard({ children }: ProfessorGuardProps) {
  const router = useRouter();
  const [role, setRole] = useState<PainelRole | null>(null);

  useEffect(() => {
    let mounted = true;

    async function validar() {
      const validatedSession = await validateSession();

      if (!mounted) return;

      if (!validatedSession) {
        router.replace(getLoginRedirectUrl());
        return;
      }

      if (validatedSession.role !== "professor") {
        router.replace(getPainelHomeByRole(validatedSession.role));
        return;
      }

      setRole(validatedSession.role);
    }

    void validar();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (role !== "professor") {
    return <PainelLoading />;
  }

  return <>{children}</>;
}

function getLoginRedirectUrl() {
  const path = `${window.location.pathname}${window.location.search}`;
  return `/login?redirect=${encodeURIComponent(path)}`;
}
