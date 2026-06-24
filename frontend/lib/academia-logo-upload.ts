import api from "@/services/api";
import {
  AVATAR_ACCEPT,
  validateAvatarFile,
} from "@/lib/avatar-upload";

export const ACADEMIA_LOGO_ACCEPT = AVATAR_ACCEPT;

type ApiData<T> = {
  data?: T;
};

function getData<T>(response: { data: unknown }): T {
  const data = response.data as ApiData<T>;
  return data.data ?? (response.data as T);
}

export function validateAcademiaLogoFile(file: File) {
  return validateAvatarFile(file);
}

export async function uploadAcademiaLogoFile<T = unknown>(
  academiaId: string,
  file: File
) {
  const error = validateAcademiaLogoFile(file);

  if (error) {
    throw new Error(error);
  }

  const formData = new FormData();
  formData.append("logo", file);

  const response = await api.post(`/academias/${academiaId}/logo`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return getData<T>(response);
}
