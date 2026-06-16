export type UsuarioLogado = {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  foto_perfil?: string | null;
  perfil_cliente?: unknown | null;
  perfil_professor?: unknown | null;
  academias?: unknown[];
};

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function getUsuario(): UsuarioLogado | null {
  if (typeof window === "undefined") return null;

  const usuario = localStorage.getItem("usuario");

  if (!usuario) return null;

  try {
    return JSON.parse(usuario);
  } catch {
    return null;
  }
}

export function clearAuthStorage() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
}