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

export async function listarHorariosDaQuadra(quadraId: string) {
  const response = await api.get(`/quadras/${quadraId}/horarios`);
  return getData(response);
}

export async function obterDisponibilidadeQuadra(quadraId: string, data: string) {
  const response = await api.get(`/quadras/${quadraId}/disponibilidade`, {
    params: { data },
  });
  return getData(response);
}

export async function listarUsuarios() {
  const response = await api.get("/users");
  return getData(response);
}

export async function criarJogo(data: {
  academia_id: string;
  quadra_id: string;
  tipo_jogo: "SIMPLES" | "DUPLA";
  inicio_em: string;
  fim_em: string;
  observacoes?: string;
}) {
  const response = await api.post("/jogos", data);
  return getData<{ id: string }>(response);
}

export async function participarJogo(jogoId: string) {
  const response = await api.post(`/jogos/${jogoId}/participar`);
  return getData(response);
}

export async function adicionarParticipanteJogo(
  jogoId: string,
  usuarioId: string,
) {
  const response = await api.post(`/jogos/${jogoId}/participantes`, {
    usuario_id: usuarioId,
  });

  return getData(response);
}

export async function removerParticipanteJogo(
  jogoId: string,
  usuarioId: string,
) {
  const response = await api.delete(
    `/jogos/${jogoId}/participantes/${usuarioId}`,
  );

  return getData(response);
}


export async function sairDoJogo(jogoId: string) {
  const response = await api.delete(`/jogos/${jogoId}/participar`);
  return getData(response);
}

export async function cancelarJogoInteiro(jogoId: string) {
  const response = await api.patch(`/jogos/${jogoId}/cancelar`);
  return getData(response);
}
