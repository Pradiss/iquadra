import api from "@/services/api";
import type { Convite, Jogo, Usuario } from "@/lib/jogos-utils";

function getData<T>(response: { data: unknown }): T {
  const data = response.data as { data?: T; user?: T };
  return data.data ?? data.user ?? (response.data as T);
}

export async function buscarUsuarioLogado() {
  const response = await api.get("/users/me");
  return getData<Usuario>(response);
}

export async function listarJogos() {
  const response = await api.get("/jogos");
  return getData<Jogo[]>(response);
}

export async function listarConvitesJogos() {
  const response = await api.get("/convites-jogos");
  return getData<Convite[]>(response);
}

export async function aceitarConviteJogo(id: string) {
  const response = await api.patch(`/convites-jogos/${id}/aceitar`);
  return getData(response);
}

export async function recusarConviteJogo(id: string) {
  const response = await api.patch(`/convites-jogos/${id}/recusar`);
  return getData(response);
}

export async function cancelarJogo(id: string) {
  const response = await api.patch(`/jogos/${id}/cancelar`);
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

export async function criarJogo(data: {
  academia_id: string;
  quadra_id: string;
  tipo_jogo: "SIMPLES" | "DUPLA";
  data: string;
  hora_inicio: string;
  hora_fim: string;
  observacoes?: string;
}) {
  const response = await api.post("/jogos", data);

  return getData<{ id: string }>(response);
}

export async function convidarJogador(
  jogoId: string,
  usuarioId: string,
) {
  const response = await api.post(
    `/jogos/${jogoId}/convidar`,
    {
      convidado_usuario_id: usuarioId,
    },
  );

  return getData(response);
}
