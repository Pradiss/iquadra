import {
  clearAuthStorage,
  getUsuario,
  updateStoredUsuario,
  type UsuarioLogado,
} from "@/lib/auth-storage";
import { getUserRole, type PainelRole } from "@/lib/user-role";
import api from "@/services/api";

type ApiData<T> = {
  data?: T;
  user?: T;
};

export type ValidatedSession = {
  usuario: UsuarioLogado;
  role: PainelRole;
};

function getData<T>(response: { data: unknown }): T {
  const data = response.data as ApiData<T>;
  return data.data ?? data.user ?? (response.data as T);
}

let validationPromise: Promise<ValidatedSession | null> | null = null;

export function getCachedSession(): ValidatedSession | null {
  const usuario = getUsuario();

  if (!usuario) {
    return null;
  }

  const role = getUserRole(usuario);

  if (!role) {
    return null;
  }

  return {
    usuario,
    role,
  };
}

export async function validateSession(): Promise<ValidatedSession | null> {
  if (validationPromise) {
    return validationPromise;
  }

  validationPromise = fetchSession().finally(() => {
    validationPromise = null;
  });

  return validationPromise;
}

async function fetchSession(): Promise<ValidatedSession | null> {
  try {
    const response = await api.get("/users/me");
    const usuario = getData<UsuarioLogado>(response);
    const role = getUserRole(usuario);

    if (!role) {
      clearAuthStorage();
      return null;
    }

    updateStoredUsuario(usuario);

    return {
      usuario,
      role,
    };
  } catch {
    clearAuthStorage();
    return null;
  }
}
