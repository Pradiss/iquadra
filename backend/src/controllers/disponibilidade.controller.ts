import type { Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  getDisponibilidadeAcademia,
  getDisponibilidadeQuadra,
} from "../services/disponibilidade.service";
import { dateOnlySchema } from "../schemas/common";
import { getRouteParam } from "../utils/request";

const disponibilidadeQuerySchema = z.object({
  data: dateOnlySchema,
}).strict();

export async function getDisponibilidadeQuadraController(
  req: AuthRequest,
  res: Response
) {
  const id = getRouteParam(req, "id");
  const { data } = disponibilidadeQuerySchema.parse(req.query);
  const disponibilidade = await getDisponibilidadeQuadra(id, data, {
    includeParticipantDetails: Boolean(req.user),
  });

  return res.json({
    success: true,
    data: disponibilidade,
  });
}

export async function getDisponibilidadeAcademiaController(
  req: AuthRequest,
  res: Response
) {
  const id = getRouteParam(req, "academiaId");
  const { data } = disponibilidadeQuerySchema.parse(req.query);
  const disponibilidade = await getDisponibilidadeAcademia(id, data, {
    includeParticipantDetails: Boolean(req.user),
  });

  return res.json({
    success: true,
    data: disponibilidade,
  });
}
