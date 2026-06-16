import api from "@/services/api";

function getData<T>(response: { data: unknown }): T {
  const data = response.data as { data?: T };
  return data.data ?? (response.data as T);
}

export async function listarAcademias() {
  const response = await api.get("/academias");
  return getData(response);
}

export async function buscarAcademia(id: string) {
  const response = await api.get(`/academias/${id}`);
  return getData(response);
}

export async function listarQuadrasDaAcademia(academiaId: string) {
  const response = await api.get(`/academias/${academiaId}/quadras`);
  return getData(response);
}