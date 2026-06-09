import { Response } from "express";

import { getRouteParam } from "../lib/http";
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

export async function createQuadraController(req: AuthRequest, res: Response) {
  try {
    const academiaId = getRouteParam(req.params.academiaId, "academiaId");
    const data = createQuadraSchema.parse(req.body);

    const quadra = await createQuadra(req.user!.id, academiaId, data);

    return res.status(201).json({
      success: true,
      message: "Quadra criada com sucesso",
      data: quadra,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao criar quadra",
    });
  }
}

export async function listQuadrasController(req: AuthRequest, res: Response) {
  try {
    const academiaId = getRouteParam(req.params.academiaId, "academiaId");

    const quadras = await listQuadrasByAcademia(academiaId);

    return res.json({
      success: true,
      total: quadras.length,
      data: quadras,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao listar quadras",
    });
  }
}

export async function getQuadraController(req: AuthRequest, res: Response) {
  try {
    const id = getRouteParam(req.params.id, "id");

    const quadra = await getQuadraById(id);

    return res.json({
      success: true,
      data: quadra,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message || "Quadra não encontrada",
    });
  }
}

export async function updateQuadraController(req: AuthRequest, res: Response) {
  try {
    const id = getRouteParam(req.params.id, "id");
    const data = updateQuadraSchema.parse(req.body);

    const quadra = await updateQuadra(req.user!.id, id, data);

    return res.json({
      success: true,
      message: "Quadra atualizada com sucesso",
      data: quadra,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao atualizar quadra",
    });
  }
}

export async function updateStatusQuadraController(
  req: AuthRequest,
  res: Response
) {
  try {
    const id = getRouteParam(req.params.id, "id");
    const { ativa } = updateStatusQuadraSchema.parse(req.body);

    const quadra = await updateStatusQuadra(req.user!.id, id, ativa);

    return res.json({
      success: true,
      message: "Status da quadra atualizado com sucesso",
      data: quadra,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao atualizar status da quadra",
    });
  }
}
