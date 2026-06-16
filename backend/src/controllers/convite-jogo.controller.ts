import type { Response } from "express";

import { AuthRequest } from "../middlewares/auth.middleware";
import { convidarJogadorSchema } from "../schemas/convite-jogo.schema";
import {
  aceitarConviteJogo,
  convidarJogadorParaJogo,
  listarConvitesJogos,
  recusarConviteJogo,
} from "../services/convite-jogo.service";
import { getRouteParam } from "../utils/request";

export async function convidarJogadorController(
  req: AuthRequest,
  res: Response
) {
  const id = getRouteParam(req, "id");
  const data = convidarJogadorSchema.parse(req.body);
  const convite = await convidarJogadorParaJogo(req.user!.id, id, data);

  return res.status(201).json({
    success: true,
    message: "Convite enviado com sucesso",
    data: convite,
  });
}

export async function listarConvitesJogosController(
  req: AuthRequest,
  res: Response
) {
  const convites = await listarConvitesJogos(req.user!.id);

  return res.json({
    success: true,
    total: convites.length,
    data: convites,
  });
}

export async function aceitarConviteJogoController(
  req: AuthRequest,
  res: Response
) {
  const id = getRouteParam(req, "id");
  const convite = await aceitarConviteJogo(req.user!.id, id);

  return res.json({
    success: true,
    message: "Convite aceito com sucesso",
    data: convite,
  });
}

export async function recusarConviteJogoController(
  req: AuthRequest,
  res: Response
) {
  const id = getRouteParam(req, "id");
  const convite = await recusarConviteJogo(req.user!.id, id);

  return res.json({
    success: true,
    message: "Convite recusado",
    data: convite,
  });
}
