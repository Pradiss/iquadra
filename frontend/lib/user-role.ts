type Usuario = {
  perfil_cliente?: unknown | null;
  perfil_professor?: unknown | null;
  academias?: unknown[];
};

export function getUserRole(usuario: Usuario | null) {
  if (!usuario) return null;

  if (Array.isArray(usuario.academias) && usuario.academias.length > 0) {
    return "admin";
  }

  if (usuario.perfil_professor) {
    return "professor";
  }

  if (usuario.perfil_cliente) {
    return "jogador";
  }

  return null;
}