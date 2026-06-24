import type { Request, Response } from "express";
import { z } from "zod";

import { dateOnlySchema } from "../schemas/common";
import {
  buscarAcademiaPublicaPorSlug,
  buscarDisponibilidadePublicaPorSlug,
  listarAcademiasPublicas,
} from "../services/public-agenda.service";
import { getRouteParam } from "../utils/request";

const disponibilidadePublicaQuerySchema = z
  .object({
    data: dateOnlySchema,
  })
  .strict();

export async function listarAcademiasPublicasController(
  _req: Request,
  res: Response,
) {
  const academias = await listarAcademiasPublicas();

  return res.json({
    success: true,
    data: academias,
  });
}

export async function buscarAcademiaPublicaController(
  req: Request,
  res: Response,
) {
  const slug = getRouteParam(req, "slug");
  const academia = await buscarAcademiaPublicaPorSlug(slug);

  return res.json({
    success: true,
    data: academia,
  });
}

export async function buscarDisponibilidadePublicaController(
  req: Request,
  res: Response,
) {
  const slug = getRouteParam(req, "slug");
  const { data } = disponibilidadePublicaQuerySchema.parse(req.query);

  const disponibilidade = await buscarDisponibilidadePublicaPorSlug(slug, data);

  return res.json({
    success: true,
    data: disponibilidade,
  });
}