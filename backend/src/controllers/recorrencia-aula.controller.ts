import type { Response } from "express";

import { AuthRequest } from "../middlewares/auth.middleware";
import {
  createRecorrenciaAulaSchema,
  listRecorrenciasAulaQuerySchema,
} from "../schemas/recorrencia-aula.schema";
import {
  cancelarRecorrenciaAula,
  createRecorrenciaAula,
  listRecorrenciasAula,
} from "../services/recorrencia-aula.service";
import { getRouteParam } from "../utils/request";

export async function createRecorrenciaAulaController(
  req: AuthRequest,
  res: Response
) {
  const data = createRecorrenciaAulaSchema.parse(req.body);
  const recorrencia = await createRecorrenciaAula(req.user!.id, data);

  return res.status(201).json({
    success: true,
    message: "Recorrencia criada com sucesso",
    data: recorrencia,
  });
}

export async function listRecorrenciasAulaController(
  req: AuthRequest,
  res: Response
) {
  const query = listRecorrenciasAulaQuerySchema.parse(req.query);
  const recorrencias = await listRecorrenciasAula(query);

  return res.json({
    success: true,
    total: recorrencias.length,
    data: recorrencias,
  });
}

export async function cancelarRecorrenciaAulaController(
  req: AuthRequest,
  res: Response
) {
  const id = getRouteParam(req, "id");
  const recorrencia = await cancelarRecorrenciaAula(req.user!.id, id);

  return res.json({
    success: true,
    message: "Recorrencia cancelada com sucesso",
    data: recorrencia,
  });
}
