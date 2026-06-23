import type { UsuarioLogado } from "@/lib/auth-storage";
import api from "@/services/api";

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

type ApiData<T> = {
  data?: T;
  user?: T;
};

function getData<T>(response: { data: unknown }): T {
  const data = response.data as ApiData<T>;
  return data.data ?? data.user ?? (response.data as T);
}

export function validateAvatarFile(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) {
    return "Escolha uma imagem JPG, PNG, WEBP ou GIF.";
  }

  if (file.size > AVATAR_MAX_BYTES) {
    return "A imagem pode ter no maximo 2MB.";
  }

  return "";
}

export async function uploadAvatarFile<T = UsuarioLogado>(file: File) {
  const error = validateAvatarFile(file);

  if (error) {
    throw new Error(error);
  }

  const formData = new FormData();
  formData.append("avatar", file);

  const response = await api.post("/users/me/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return getData<T>(response);
}

export async function removeAvatarFile<T = UsuarioLogado>() {
  const response = await api.delete("/users/me/avatar");
  return getData<T>(response);
}
