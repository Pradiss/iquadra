import type { Response } from "express";

import { AuthRequest } from "../middlewares/auth.middleware";
import {
  createHorarioQuadraSchema,
  updateHorarioQuadraSchema,
} from "../schemas/horario-quadra.schema";
import {
  createHorarioQuadra,
  deleteHorarioQuadra,
  listHorariosQuadra,
  updateHorarioQuadra,
} from "../services/horario-quadra.service";
import { getRouteParam } from "../utils/request";

export async function createHorarioQuadraController(
  req: AuthRequest,
  res: Response
) {
  const quadraId = getRouteParam(req, "quadraId");
  const data = createHorarioQuadraSchema.parse(req.body);
  const horario = await createHorarioQuadra(req.user!.id, quadraId, data);

  return res.status(201).json({
    success: true,
    message: "Horario criado com sucesso",
    data: horario,
  });
}

export async function listHorariosQuadraController(
  req: AuthRequest,
  res: Response
) {
  const quadraId = getRouteParam(req, "quadraId");
  const horarios = await listHorariosQuadra(quadraId);

  return res.json({
    success: true,
    total: horarios.length,
    data: horarios,
  });
}

export async function updateHorarioQuadraController(
  req: AuthRequest,
  res: Response
) {
  const id = getRouteParam(req, "id");
  const data = updateHorarioQuadraSchema.parse(req.body);
  const horario = await updateHorarioQuadra(req.user!.id, id, data);

  return res.json({
    success: true,
    message: "Horario atualizado com sucesso",
    data: horario,
  });
}

export async function deleteHorarioQuadraController(
  req: AuthRequest,
  res: Response
) {
  const id = getRouteParam(req, "id");
  await deleteHorarioQuadra(req.user!.id, id);

  return res.json({
    success: true,
    message: "Horario removido com sucesso",
  });
}
