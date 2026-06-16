import type { Response } from "express";

import { AuthRequest } from "../middlewares/auth.middleware";
import {
  createQuadraSchema,
  updateQuadraSchema,
  updateStatusQuadraSchema,
} from "../schemas/quadra.schema";
import {
  createQuadra,
  getQuadraById,
  listQuadrasByAcademia,
  updateQuadra,
  updateStatusQuadra,
} from "../services/quadra.service";
import { getRouteParam } from "../utils/request";

export async function createQuadraController(req: AuthRequest, res: Response) {
  const academiaId = getRouteParam(req, "academiaId");
  const data = createQuadraSchema.parse(req.body);
  const quadra = await createQuadra(req.user!.id, academiaId, data);

  return res.status(201).json({
    success: true,
    message: "Quadra criada com sucesso",
    data: quadra,
  });
}

export async function listQuadrasController(req: AuthRequest, res: Response) {
  const academiaId = getRouteParam(req, "academiaId");
  const quadras = await listQuadrasByAcademia(academiaId);

  return res.json({
    success: true,
    total: quadras.length,
    data: quadras,
  });
}

export async function getQuadraController(req: AuthRequest, res: Response) {
  const id = getRouteParam(req, "id");
  const quadra = await getQuadraById(id);

  return res.json({
    success: true,
    data: quadra,
  });
}

export async function updateQuadraController(req: AuthRequest, res: Response) {
  const id = getRouteParam(req, "id");
  const data = updateQuadraSchema.parse(req.body);
  const quadra = await updateQuadra(req.user!.id, id, data);

  return res.json({
    success: true,
    message: "Quadra atualizada com sucesso",
    data: quadra,
  });
}

export async function updateStatusQuadraController(
  req: AuthRequest,
  res: Response
) {
  const id = getRouteParam(req, "id");
  const { ativa } = updateStatusQuadraSchema.parse(req.body);
  const quadra = await updateStatusQuadra(req.user!.id, id, ativa);

  return res.json({
    success: true,
    message: "Status da quadra atualizado com sucesso",
    data: quadra,
  });
}
