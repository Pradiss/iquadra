import { getPreferredEmpresa, isCompanyAdminRole } from "./perfis"
import type {
  AcademiaResumo,
  AcademiaUsuario,
  AuthSessionSnapshot,
  PerfilUsuario,
  Usuario,
} from "../types/auth"

export type AcademiaSessionContext = {
  academia: AcademiaResumo
  perfil: PerfilUsuario
  vinculoId: string | null
}

function getFallbackPerfil(usuario: Usuario): PerfilUsuario {
  if (usuario.temPerfilProfessor) {
    return "PROFESSOR"
  }

  return "JOGADOR"
}

function toAcademiaContext(
  vinculo: AcademiaUsuario
): AcademiaSessionContext {
  return {
    academia: vinculo.academia,
    perfil: vinculo.perfil,
    vinculoId: vinculo.id,
  }
}

export function listActiveAcademiaContexts(
  session?: AuthSessionSnapshot | null
) {
  return (session?.usuario.academias ?? [])
    .filter((vinculo) => vinculo.status === "ATIVO")
    .map(toAcademiaContext)
}

export function listManagedAcademiaContexts(
  session?: AuthSessionSnapshot | null
) {
  return listActiveAcademiaContexts(session).filter((context) =>
    isCompanyAdminRole(context.perfil)
  )
}

export function getPreferredAcademiaContext(
  session?: AuthSessionSnapshot | null
) {
  if (!session) {
    return null
  }

  const preferred = getPreferredEmpresa(session.usuario.academias)

  if (preferred) {
    return toAcademiaContext(preferred)
  }

  if (session.academiaAtual) {
    return {
      academia: session.academiaAtual,
      perfil: session.perfilAtual,
      vinculoId: session.vinculoAtualId,
    }
  }

  return null
}

export function resolveAcademiaContext(
  session?: AuthSessionSnapshot | null,
  academiaId?: string | null
) {
  const contexts = listActiveAcademiaContexts(session)

  if (academiaId) {
    return contexts.find((context) => context.academia.id === academiaId) ?? null
  }

  return getPreferredAcademiaContext(session)
}

export function getPerfilParaAcademia(
  session?: AuthSessionSnapshot | null,
  academiaId?: string | null
) {
  const context = resolveAcademiaContext(session, academiaId)

  if (context) {
    return context.perfil
  }

  if (!session) {
    return null
  }

  return getFallbackPerfil(session.usuario)
}

export function canManageAcademia(perfil?: PerfilUsuario | null) {
  return isCompanyAdminRole(perfil)
}

export function canOperateAcademia(perfil?: PerfilUsuario | null) {
  return (
    perfil === "DONO" ||
    perfil === "ADMIN_ACADEMIA" ||
    perfil === "FUNCIONARIO" ||
    perfil === "PROFESSOR"
  )
}
