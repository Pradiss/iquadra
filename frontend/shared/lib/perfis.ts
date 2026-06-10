import type {
  AcademiaUsuario,
  PerfilAcademiaUsuario,
  PerfilUsuario,
} from "../types/auth"

export const PERFIL_LABELS: Record<PerfilUsuario, string> = {
  JOGADOR: "Jogador",
  PROFESSOR: "Professor",
  FUNCIONARIO: "Operacao",
  ADMIN_ACADEMIA: "Admin da academia",
  DONO: "Proprietario",
}

const PERFIL_PRIORITY: Record<PerfilAcademiaUsuario, number> = {
  DONO: 4,
  ADMIN_ACADEMIA: 3,
  FUNCIONARIO: 2,
  PROFESSOR: 1,
}

export type UserExperience = "PLAYER" | "PROFESSOR" | "COMPANY_ADMIN"

export function getPerfilLabel(perfil?: PerfilUsuario | null) {
  if (!perfil) {
    return PERFIL_LABELS.JOGADOR
  }

  return PERFIL_LABELS[perfil]
}

export function isCompanyAdminRole(perfil?: PerfilUsuario | null) {
  return (
    perfil === "DONO" ||
    perfil === "ADMIN_ACADEMIA" ||
    perfil === "FUNCIONARIO"
  )
}

export function isProfessorRole(perfil?: PerfilUsuario | null) {
  return perfil === "PROFESSOR"
}

export function getUserExperience(perfil?: PerfilUsuario | null): UserExperience {
  if (isCompanyAdminRole(perfil)) {
    return "COMPANY_ADMIN"
  }

  if (isProfessorRole(perfil)) {
    return "PROFESSOR"
  }

  return "PLAYER"
}

export function getPreferredEmpresa(empresas: AcademiaUsuario[]) {
  return [...empresas]
    .filter((empresa) => empresa.status === "ATIVO")
    .sort((primeira, segunda) => {
      const prioridade =
        PERFIL_PRIORITY[segunda.perfil] - PERFIL_PRIORITY[primeira.perfil]

      if (prioridade !== 0) {
        return prioridade
      }

      return primeira.academia.nome.localeCompare(
        segunda.academia.nome,
        "pt-BR"
      )
    })[0] ?? null
}
