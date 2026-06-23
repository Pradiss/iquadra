export type AcademiaUsuarioLogado = {
  id?: string;
  academia_id?: string;
  usuario_id?: string;
  perfil?: string | null;
  status?: string | null;
  academia?: {
    id?: string;
    nome?: string;
    slug?: string;
    cidade?: string | null;
    estado?: string | null;
    status?: string | null;
  } | null;
};

export type UsuarioLogado = {
  id: string;
  supabaseUserId?: string | null;
  nome: string;
  email: string;
  telefone?: string;
  foto_perfil?: string | null;
  fotoUrl?: string | null;
  fotoPath?: string | null;
  perfil_cliente?: unknown | null;
  perfil_professor?: unknown | null;
  academias?: AcademiaUsuarioLogado[];
};

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
  if (typeof window === "undefined") return;

  localStorage.removeItem("usuario");
}
