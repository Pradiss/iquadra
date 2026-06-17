import type { AcademiaUsuarioLogado } from "@/lib/auth-storage";

export type PainelRole = "admin" | "professor" | "jogador";

type Usuario = {
  perfil_cliente?: unknown | null;
  perfil_professor?: unknown | null;
  academias?: AcademiaUsuarioLogado[];
};

const adminPerfis = new Set(["DONO", "ADMIN_ACADEMIA", "FUNCIONARIO"]);

function isVinculoAtivo(vinculo: AcademiaUsuarioLogado) {
  return vinculo.status === "ATIVO";
}

function getPerfil(vinculo: AcademiaUsuarioLogado) {
  return vinculo.perfil ?? "";
}

export function getAdminAcademias(usuario: Usuario | null) {
  if (!Array.isArray(usuario?.academias)) return [];

  return usuario.academias.filter(
    (vinculo) => isVinculoAtivo(vinculo) && adminPerfis.has(getPerfil(vinculo))
  );
}

export function getPainelHomeByRole(role: PainelRole) {
  if (role === "admin") return "/painel/admin";
  if (role === "professor") return "/painel/professor";
  return "/painel/jogador";
}

export function getUserRole(usuario: Usuario | null): PainelRole | null {
  if (!usuario) return null;

  if (getAdminAcademias(usuario).length > 0) {
    return "admin";
  }

  const professorVinculado = usuario.academias?.some(
    (vinculo) => isVinculoAtivo(vinculo) && getPerfil(vinculo) === "PROFESSOR"
  );

  if (usuario.perfil_professor || professorVinculado) {
    return "professor";
  }

  if (usuario.perfil_cliente) {
    return "jogador";
  }

  return null;
}
