import type { Response } from "express";

import { AuthRequest } from "../middlewares/auth.middleware";
import { createBloqueioSchema } from "../schemas/bloqueio.schema";
import {
  createBloqueio,
  deleteBloqueio,
  listBloqueiosByQuadra,
} from "../services/bloqueio.service";
import { getRouteParam } from "../utils/request";

export async function createBloqueioController(
  req: AuthRequest,
  res: Response
) {
  const quadraId = getRouteParam(req, "quadraId");
  const data = createBloqueioSchema.parse(req.body);
  const bloqueio = await createBloqueio(req.user!.id, quadraId, data);

  return res.status(201).json({
    success: true,
    message: "Bloqueio criado com sucesso",
    data: bloqueio,
  });
}

export async function listBloqueiosController(req: AuthRequest, res: Response) {
  const quadraId = getRouteParam(req, "quadraId");
  const bloqueios = await listBloqueiosByQuadra(quadraId);

  return res.json({
    success: true,
    total: bloqueios.length,
    data: bloqueios,
  });
}

export async function deleteBloqueioController(
  req: AuthRequest,
  res: Response
) {
  const id = getRouteParam(req, "id");
  await deleteBloqueio(req.user!.id, id);

  return res.json({
    success: true,
    message: "Bloqueio removido com sucesso",
  });
}
