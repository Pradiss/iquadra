import { Request, Response } from "express";

import { getRouteParam } from "../lib/http";
import { createAcademiaSchema } from "../schemas/academia.schema";
import {
  createAcademia,
  getAcademiaById,
  listAcademias,
} from "../services/academia.service";

export async function createAcademiaController(req: Request, res: Response) {
  try {
    const data = createAcademiaSchema.parse(req.body);

    const academia = await createAcademia(data);

    return res.status(201).json({
      success: true,
      message: "Academia criada com sucesso",
      data: academia,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao criar academia",
    });
  }
}

export async function listAcademiasController(req: Request, res: Response) {
  const academias = await listAcademias();

  return res.json({
    success: true,
    total: academias.length,
    data: academias,
  });
}

export async function getAcademiaController(req: Request, res: Response) {
  try {
    const id = getRouteParam(req.params.id, "id");

    const academia = await getAcademiaById(id);

    return res.json({
      success: true,
      data: academia,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message || "Academia não encontrada",
    });
  }
}
