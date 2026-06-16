import type { Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../middlewares/auth.middleware";
import { getDisponibilidadeQuadra } from "../services/disponibilidade.service";
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
  const disponibilidade = await getDisponibilidadeQuadra(id, data);

  return res.json({
    success: true,
    data: disponibilidade,
  });
}
