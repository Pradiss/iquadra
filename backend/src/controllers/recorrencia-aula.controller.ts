import { Request, Response } from "express";

import { AuthRequest } from "../middlewares/auth.middleware";
import { createRecorrenciaAulaSchema } from "../schemas/recorrencia-aula.schema";
import {
  cancelarRecorrenciaAula,
  createRecorrenciaAula,
  listRecorrenciasAula,
} from "../services/recorrencia-aula.service";

export async function createRecorrenciaAulaController(
  req: AuthRequest,
  res: Response
) {
  try {
    const data = createRecorrenciaAulaSchema.parse(req.body);

    const recorrencia = await createRecorrenciaAula(req.user!.id, data);

    return res.status(201).json({
      success: true,
      message: "Recorrência criada com sucesso",
      data: recorrencia,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao criar recorrência",
    });
  }
}

export async function listRecorrenciasAulaController(
  req: Request,
  res: Response
) {
  try {
    const { academia_id, quadra_id, professor_id } = req.query;

    const recorrencias = await listRecorrenciasAula({
      academia_id: academia_id as string | undefined,
      quadra_id: quadra_id as string | undefined,
      professor_id: professor_id as string | undefined,
    });

    return res.json({
      success: true,
      total: recorrencias.length,
      data: recorrencias,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao listar recorrências",
    });
  }
}

export async function cancelarRecorrenciaAulaController(
  req: AuthRequest,
  res: Response
) {
  try {
    const { id } = req.params;

    const recorrencia = await cancelarRecorrenciaAula(req.user!.id, id);

    return res.json({
      success: true,
      message: "Recorrência cancelada com sucesso",
      data: recorrencia,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao cancelar recorrência",
    });
  }
}