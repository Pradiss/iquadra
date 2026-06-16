import type { Response } from "express";

import { AuthRequest } from "../middlewares/auth.middleware";
import { createAulaSchema, listAulasQuerySchema } from "../schemas/aula.schema";
import {
  cancelarAula,
  createAula,
  getAulaById,
  listAulas,
} from "../services/aula.service";
import { getRouteParam } from "../utils/request";

export async function createAulaController(req: AuthRequest, res: Response) {
  const data = createAulaSchema.parse(req.body);
  const aula = await createAula(req.user!.id, data);

  return res.status(201).json({
    success: true,
    message: "Aula criada com sucesso",
    data: aula,
  });
}

export async function listAulasController(req: AuthRequest, res: Response) {
  const query = listAulasQuerySchema.parse(req.query);
  const aulas = await listAulas(query);

  return res.json({
    success: true,
    total: aulas.length,
    data: aulas,
  });
}

export async function getAulaController(req: AuthRequest, res: Response) {
  const id = getRouteParam(req, "id");
  const aula = await getAulaById(id);

  return res.json({
    success: true,
    data: aula,
  });
}

export async function cancelarAulaController(req: AuthRequest, res: Response) {
  const id = getRouteParam(req, "id");
  const aula = await cancelarAula(req.user!.id, id);

  return res.json({
    success: true,
    message: "Aula cancelada com sucesso",
    data: aula,
  });
}
