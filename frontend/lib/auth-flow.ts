import { persistUsuario, type UsuarioLogado } from "@/lib/auth-storage";
import { buscarUltimaAcademia } from "@/lib/last-academia";
import { getPainelHomeByRole, getUserRole } from "@/lib/user-role";

type PersistAuthenticatedUsuarioOptions = {
  persistent?: boolean;
};

export function persistAuthenticatedUsuario(
  usuario: UsuarioLogado,
  options: PersistAuthenticatedUsuarioOptions = {}
) {
  persistUsuario(usuario, {
    persistent: options.persistent === true,
  });
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
