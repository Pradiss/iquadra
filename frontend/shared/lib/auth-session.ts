import { getPreferredEmpresa, isCompanyAdminRole } from "./perfis"
import { saveSession, saveToken } from "./auth-storage"
import type {
  AuthResponse,
  AuthSessionSnapshot,
  PerfilUsuario,
  Usuario,
} from "../types/auth"

function getFallbackPerfil(usuario: Usuario): PerfilUsuario {
  if (usuario.temPerfilProfessor) {
    return "PROFESSOR"
  }

  return "JOGADOR"
}

function getRedirectPath(session: AuthSessionSnapshot) {
  return isCompanyAdminRole(session.perfilAtual) ? "/painel/admin" : "/painel"
}

function buildSessionFromAuth(response: AuthResponse): AuthSessionSnapshot {
  const academiaPreferida = getPreferredEmpresa(response.usuario.academias)

  return {
    usuario: response.usuario,
    academiaAtual: academiaPreferida?.academia ?? null,
    perfilAtual: academiaPreferida?.perfil ?? getFallbackPerfil(response.usuario),
    vinculoAtualId: academiaPreferida?.id ?? null,
  }
}

export async function completeAuthFlow(response: AuthResponse) {
  const session = buildSessionFromAuth(response)

  saveToken(response.token)
  saveSession(session)

  return {
    session,
    redirectTo: getRedirectPath(session),
  }
}
