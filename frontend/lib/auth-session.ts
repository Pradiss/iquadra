import { clearAuthStorage, type UsuarioLogado } from "@/lib/auth-storage";
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

export async function validateSession(): Promise<ValidatedSession | null> {
  try {
    const response = await api.get("/users/me");
    const usuario = getData<UsuarioLogado>(response);
    const role = getUserRole(usuario);

    if (!role) {
      clearAuthStorage();
      return null;
    }

    localStorage.setItem("usuario", JSON.stringify(usuario));

    return {
      usuario,
      role,
    };
  } catch {
    clearAuthStorage();
    return null;
  }
}
