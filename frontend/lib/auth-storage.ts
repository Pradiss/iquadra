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
  telefone?: string | null;
  foto_perfil?: string | null;
  fotoUrl?: string | null;
  fotoPath?: string | null;
  perfil_cliente?: unknown | null;
  perfil_professor?: unknown | null;
  academias?: AcademiaUsuarioLogado[];
};

export const USER_STORAGE_KEY = "usuario";
export const KEEP_LOGGED_IN_STORAGE_KEY = "playfy_manter_logado";

type PersistUsuarioOptions = {
  persistent?: boolean;
};

export function getUsuario(): UsuarioLogado | null {
  return (
    getStoredUsuario(localStorageSafe()) ?? getStoredUsuario(sessionStorageSafe())
  );
}

export function persistUsuario(
  usuario: UsuarioLogado,
  options: PersistUsuarioOptions = {}
) {
  const persistent = options.persistent === true;
  const serializedUsuario = JSON.stringify(usuario);

  if (persistent) {
    safeStorageSet(localStorageSafe(), USER_STORAGE_KEY, serializedUsuario);
    safeStorageSet(localStorageSafe(), KEEP_LOGGED_IN_STORAGE_KEY, "true");
    safeStorageRemove(sessionStorageSafe(), USER_STORAGE_KEY);
    return;
  }

  safeStorageSet(sessionStorageSafe(), USER_STORAGE_KEY, serializedUsuario);
  safeStorageRemove(localStorageSafe(), USER_STORAGE_KEY);
  safeStorageRemove(localStorageSafe(), KEEP_LOGGED_IN_STORAGE_KEY);
}

export function updateStoredUsuario(usuario: UsuarioLogado) {
  persistUsuario(usuario, {
    persistent: isKeepLoggedIn(),
  });
}

export function isKeepLoggedIn() {
  return safeStorageGet(localStorageSafe(), KEEP_LOGGED_IN_STORAGE_KEY) === "true";
}

export function clearAuthStorage() {
  safeStorageRemove(localStorageSafe(), USER_STORAGE_KEY);
  safeStorageRemove(localStorageSafe(), KEEP_LOGGED_IN_STORAGE_KEY);
  safeStorageRemove(sessionStorageSafe(), USER_STORAGE_KEY);
}

function getStoredUsuario(storage: Storage | null) {
  const usuario = safeStorageGet(storage, USER_STORAGE_KEY);

  if (!usuario) return null;

  try {
    return JSON.parse(usuario) as UsuarioLogado;
  } catch {
    return null;
  }
}

function localStorageSafe(): Storage | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function sessionStorageSafe(): Storage | null {
  if (typeof window === "undefined") return null;

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function safeStorageGet(storage: Storage | null | undefined, key: string) {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function safeStorageSet(
  storage: Storage | null | undefined,
  key: string,
  value: string
) {
  try {
    storage?.setItem(key, value);
  } catch {}
}

function safeStorageRemove(storage: Storage | null | undefined, key: string) {
  try {
    storage?.removeItem(key);
  } catch {}
}
