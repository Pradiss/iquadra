import type { Response } from "express";

import { AuthRequest } from "../middlewares/auth.middleware";
import { createAmizadeSchema } from "../schemas/amizade.schema";
import {
  aceitarAmizade,
  listarAmizades,
  recusarAmizade,
  removerAmizade,
  solicitarAmizade,
} from "../services/amizade.service";
import { getRouteParam } from "../utils/request";

export async function solicitarAmizadeController(
  req: AuthRequest,
  res: Response
) {
  const data = createAmizadeSchema.parse(req.body);
  const amizade = await solicitarAmizade(req.user!.id, data);

  return res.status(201).json({
    success: true,
    message: "Solicitacao de amizade enviada",
    data: amizade,
  });
}

export async function listarAmizadesController(
  req: AuthRequest,
  res: Response
) {
  const amizades = await listarAmizades(req.user!.id);

  return res.json({
    success: true,
    total: amizades.length,
    data: amizades,
  });
}

export async function aceitarAmizadeController(
  req: AuthRequest,
  res: Response
) {
  const id = getRouteParam(req, "id");
  const amizade = await aceitarAmizade(req.user!.id, id);

  return res.json({
    success: true,
    message: "Solicitacao aceita",
    data: amizade,
  });
}

export async function recusarAmizadeController(
  req: AuthRequest,
  res: Response
) {
  const id = getRouteParam(req, "id");
  const amizade = await recusarAmizade(req.user!.id, id);

  return res.json({
    success: true,
    message: "Solicitacao recusada",
    data: amizade,
  });
}

export async function removerAmizadeController(
  req: AuthRequest,
  res: Response
) {
  const id = getRouteParam(req, "id");
  await removerAmizade(req.user!.id, id);

  return res.json({
    success: true,
    message: "Amizade removida",
  });
}
