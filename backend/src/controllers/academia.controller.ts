import type { Request, Response } from "express";

import { createAcademiaSchema } from "../schemas/academia.schema";
import {
  createAcademia,
  getAcademiaById,
  listAcademias,
} from "../services/academia.service";
import {
  uploadAcademiaLogo,
} from "../services/academia-logo.service";
import type { AvatarFile } from "../services/avatar-storage.service";
import type { AuthRequest } from "../middlewares/auth.middleware";
import { getRouteParam } from "../utils/request";

export async function createAcademiaController(req: Request, res: Response) {
  const data = createAcademiaSchema.parse(req.body);
  const academia = await createAcademia(data);

  return res.status(201).json({
    success: true,
    message: "Academia criada com sucesso",
    data: academia,
  });
}

export async function listAcademiasController(_req: Request, res: Response) {
  const academias = await listAcademias();

  return res.json({
    success: true,
    total: academias.length,
    data: academias,
  });
}

export async function getAcademiaController(req: Request, res: Response) {
  const id = getRouteParam(req, "id");
  const academia = await getAcademiaById(id);

  return res.json({
    success: true,
    data: academia,
  });
}

export async function uploadAcademiaLogoController(
  req: AuthRequest,
  res: Response
) {
  const id = getRouteParam(req, "id");
  const academia = await uploadAcademiaLogo(
    req.user!.id,
    id,
    req.file as AvatarFile | undefined
  );

  return res.json({
    success: true,
    message: "Logo da academia atualizado com sucesso",
    data: academia,
  });
}
