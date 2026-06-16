import type { Response } from "express";
import { z } from "zod";

import { AuthRequest } from "../middlewares/auth.middleware";
import {
  getAgendaAcademia,
  getDashboardAcademia,
} from "../services/dashboard.service";
import { dateOnlySchema } from "../schemas/common";
import { getRouteParam } from "../utils/request";

const agendaQuerySchema = z.object({
  data: dateOnlySchema,
}).strict();

export async function getDashboardAcademiaController(
  req: AuthRequest,
  res: Response
) {
  const academiaId = getRouteParam(req, "academiaId");
  const dashboard = await getDashboardAcademia(req.user!.id, academiaId);

  return res.json({
    success: true,
    data: dashboard,
  });
}

export async function getAgendaAcademiaController(
  req: AuthRequest,
  res: Response
) {
  const academiaId = getRouteParam(req, "academiaId");
  const { data } = agendaQuerySchema.parse(req.query);
  const agenda = await getAgendaAcademia(req.user!.id, academiaId, data);

  return res.json({
    success: true,
    data: agenda,
  });
}
