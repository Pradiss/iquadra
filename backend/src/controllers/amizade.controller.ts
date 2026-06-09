import { Response } from "express";

import { getRouteParam } from "../lib/http";
import { AuthRequest } from "../middlewares/auth.middleware";
import { createAmizadeSchema } from "../schemas/amizade.schema";
import {
  aceitarAmizade,
  listarAmizades,
  recusarAmizade,
  removerAmizade,
  solicitarAmizade,
} from "../services/amizade.service";

export async function solicitarAmizadeController(
  req: AuthRequest,
  res: Response
) {
  try {
    const data = createAmizadeSchema.parse(req.body);

    const amizade = await solicitarAmizade(req.user!.id, data);

    return res.status(201).json({
      success: true,
      message: "Solicitação de amizade enviada",
      data: amizade,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao enviar solicitação",
    });
  }
}

export async function listarAmizadesController(
  req: AuthRequest,
  res: Response
) {
  try {
    const amizades = await listarAmizades(req.user!.id);

    return res.json({
      success: true,
      total: amizades.length,
      data: amizades,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao listar amizades",
    });
  }
}

export async function aceitarAmizadeController(
  req: AuthRequest,
  res: Response
) {
  try {
    const id = getRouteParam(req.params.id, "id");

    const amizade = await aceitarAmizade(req.user!.id, id);

    return res.json({
      success: true,
      message: "Solicitação aceita",
      data: amizade,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao aceitar solicitação",
    });
  }
}

export async function recusarAmizadeController(
  req: AuthRequest,
  res: Response
) {
  try {
    const id = getRouteParam(req.params.id, "id");

    const amizade = await recusarAmizade(req.user!.id, id);

    return res.json({
      success: true,
      message: "Solicitação recusada",
      data: amizade,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao recusar solicitação",
    });
  }
}

export async function removerAmizadeController(
  req: AuthRequest,
  res: Response
) {
  try {
    const id = getRouteParam(req.params.id, "id");

    await removerAmizade(req.user!.id, id);

    return res.json({
      success: true,
      message: "Amizade removida",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao remover amizade",
    });
  }
}
