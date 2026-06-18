import type { Response } from "express";

import { AuthRequest } from "../middlewares/auth.middleware";
import {
  adicionarParticipanteJogoSchema,
  createJogoSchema,
  listJogosQuerySchema,
} from "../schemas/jogo.schema";
import {
  adicionarParticipanteJogo,
  cancelarJogo,
  createJogo,
  getJogoById,
  listJogos,
  participarJogo,
  removerParticipanteJogo,
  sairJogo,
} from "../services/jogo.service";
import { getRouteParam } from "../utils/request";

export async function createJogoController(req: AuthRequest, res: Response) {
  const data = createJogoSchema.parse(req.body);
  const jogo = await createJogo(req.user!.id, data);

  return res.status(201).json({
    success: true,
    message: "Jogo criado com sucesso",
    data: jogo,
  });
}

export async function listJogosController(req: AuthRequest, res: Response) {
  const query = listJogosQuerySchema.parse(req.query);
  const jogos = await listJogos(query);

  return res.json({
    success: true,
    total: jogos.length,
    data: jogos,
  });
}

export async function getJogoController(req: AuthRequest, res: Response) {
  const id = getRouteParam(req, "id");
  const jogo = await getJogoById(id);

  return res.json({
    success: true,
    data: jogo,
  });
}

export async function participarJogoController(req: AuthRequest, res: Response) {
  const id = getRouteParam(req, "id");
  const jogo = await participarJogo(req.user!.id, id);

  return res.json({
    success: true,
    message: "Voce entrou no jogo",
    data: jogo,
  });
}

export async function adicionarParticipanteJogoController(
  req: AuthRequest,
  res: Response
) {
  const id = getRouteParam(req, "id");
  const data = adicionarParticipanteJogoSchema.parse(req.body);
  const jogo = await adicionarParticipanteJogo(req.user!.id, id, data);

  return res.status(201).json({
    success: true,
    message: "Participante adicionado com sucesso",
    data: jogo,
  });
}

export async function removerParticipanteJogoController(
  req: AuthRequest,
  res: Response
) {
  const id = getRouteParam(req, "id");
  const usuarioId = getRouteParam(req, "usuarioId");
  const jogo = await removerParticipanteJogo(req.user!.id, id, usuarioId);

  return res.json({
    success: true,
    message: "Participante removido com sucesso",
    data: jogo,
  });
}

export async function sairJogoController(req: AuthRequest, res: Response) {
  const id = getRouteParam(req, "id");
  const jogo = await sairJogo(req.user!.id, id);

  return res.json({
    success: true,
    message: "Voce saiu do jogo",
    data: jogo,
  });
}

export async function cancelarJogoController(req: AuthRequest, res: Response) {
  const id = getRouteParam(req, "id");
  const jogo = await cancelarJogo(req.user!.id, id);

  return res.json({
    success: true,
    message: "Jogo cancelado com sucesso",
    data: jogo,
  });
}
