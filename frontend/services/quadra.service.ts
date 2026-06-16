import api from "@/services/api";

function getData<T>(response: { data: unknown }): T {
  const data = response.data as { data?: T };
  return data.data ?? (response.data as T);
}

export async function listarHorariosDaQuadra(quadraId: string) {
  const response = await api.get(`/quadras/${quadraId}/horarios`);
  return getData(response);
}

export async function obterDisponibilidadeQuadra(
  quadraId: string,
  data: string,
) {
  const response = await api.get(
    `/quadras/${quadraId}/disponibilidade`,
    {
      params: { data },
    },
  );

  return getData(response);
}