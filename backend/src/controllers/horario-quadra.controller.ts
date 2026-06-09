import { Response } from "express";

import { getRouteParam } from "../lib/http";
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

export async function createHorarioQuadraController(
  req: AuthRequest,
  res: Response
) {
  try {
    const quadraId = getRouteParam(req.params.quadraId, "quadraId");
    const data = createHorarioQuadraSchema.parse(req.body);

    const horario = await createHorarioQuadra(req.user!.id, quadraId, data);

    return res.status(201).json({
      success: true,
      message: "Horário criado com sucesso",
      data: horario,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao criar horário",
    });
  }
}

export async function listHorariosQuadraController(
  req: AuthRequest,
  res: Response
) {
  try {
    const quadraId = getRouteParam(req.params.quadraId, "quadraId");

    const horarios = await listHorariosQuadra(quadraId);

    return res.json({
      success: true,
      total: horarios.length,
      data: horarios,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao listar horários",
    });
  }
}

export async function updateHorarioQuadraController(
  req: AuthRequest,
  res: Response
) {
  try {
    const id = getRouteParam(req.params.id, "id");
    const data = updateHorarioQuadraSchema.parse(req.body);

    const horario = await updateHorarioQuadra(req.user!.id, id, data);

    return res.json({
      success: true,
      message: "Horário atualizado com sucesso",
      data: horario,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao atualizar horário",
    });
  }
}

export async function deleteHorarioQuadraController(
  req: AuthRequest,
  res: Response
) {
  try {
    const id = getRouteParam(req.params.id, "id");

    await deleteHorarioQuadra(req.user!.id, id);

    return res.json({
      success: true,
      message: "Horário removido com sucesso",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao remover horário",
    });
  }
}
