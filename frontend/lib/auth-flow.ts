import type { UsuarioLogado } from "@/lib/auth-storage";
import { buscarUltimaAcademia } from "@/lib/last-academia";
import { getPainelHomeByRole, getUserRole } from "@/lib/user-role";

export function persistAuthenticatedUsuario(usuario: UsuarioLogado) {
  try {
    localStorage.setItem("usuario", JSON.stringify(usuario));
    console.log("Usuário salvo no localStorage");
  } catch (error) {
    console.error("Erro ao salvar usuário no localStorage", error);
  }
}

export function getRedirectAfterAuth(
  usuario: UsuarioLogado,
  requestedRedirect?: string | null
) {
  if (
    requestedRedirect &&
    requestedRedirect.startsWith("/") &&
    !requestedRedirect.startsWith("//") &&
    !requestedRedirect.startsWith("/login")
  ) {
    return requestedRedirect;
  }

  const role = getUserRole(usuario);

  if (!role) {
    return "/login";
  }

  if (role === "jogador") {
    const ultimaAcademiaId = buscarUltimaAcademia();

    if (ultimaAcademiaId) {
      return `/painel/jogador/academia/${ultimaAcademiaId}`;
    }
  }

  return getPainelHomeByRole(role);
}
