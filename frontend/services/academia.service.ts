import api from "@/services/api";
import {
  AVATAR_ACCEPT,
  validateAvatarFile,
} from "@/lib/avatar-upload";

export const ACADEMIA_LOGO_ACCEPT = AVATAR_ACCEPT;

type ApiData<T> = {
  data?: T;
};

export type AcademiaDetalhes = {
  id: string;
  nome: string;
  slug: string;
  cnpj?: string | null;
  telefone?: string | null;
  email?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  status?: string | null;
  logo_url?: string | null;
};

export type AtualizarAcademiaPayload = Partial<{
  nome: string;
  slug: string;
  cnpj: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
}>;

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

export async function listarAcademias() {
  const response = await api.get("/academias");
  return getData(response);
}

export async function buscarAcademia(id: string) {
  const response = await api.get(`/academias/${id}`);
  return getData<AcademiaDetalhes>(response);
}

export async function atualizarAcademia(
  id: string,
  data: AtualizarAcademiaPayload
) {
  const response = await api.put(`/academias/${id}`, data);
  return getData<AcademiaDetalhes>(response);
}

export async function listarQuadrasDaAcademia(academiaId: string) {
  const response = await api.get(`/academias/${academiaId}/quadras`);
  return getData(response);
}
