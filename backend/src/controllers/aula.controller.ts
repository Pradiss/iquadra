import { Request, Response } from "express";

import { AuthRequest } from "../middlewares/auth.middleware";
import { createAulaSchema } from "../schemas/aula.schema";
import {
  cancelarAula,
  createAula,
  getAulaById,
  listAulas,
} from "../services/aula.service";

export async function createAulaController(req: AuthRequest, res: Response) {
  try {
    const data = createAulaSchema.parse(req.body);

    const aula = await createAula(req.user!.id, data);

    return res.status(201).json({
      success: true,
      message: "Aula criada com sucesso",
      data: aula,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao criar aula",
    });
  }
}

export async function listAulasController(req: Request, res: Response) {
  try {
    const { academia_id, quadra_id, professor_id, cliente_id, data } = req.query;

    const aulas = await listAulas({
      academia_id: academia_id as string | undefined,
      quadra_id: quadra_id as string | undefined,
      professor_id: professor_id as string | undefined,
      cliente_id: cliente_id as string | undefined,
      data: data as string | undefined,
    });

    return res.json({
      success: true,
      total: aulas.length,
      data: aulas,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao listar aulas",
    });
  }
}

export async function getAulaController(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const aula = await getAulaById(id);

    return res.json({
      success: true,
      data: aula,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message || "Aula não encontrada",
    });
  }
}

export async function cancelarAulaController(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const aula = await cancelarAula(req.user!.id, id);

    return res.json({
      success: true,
      message: "Aula cancelada com sucesso",
      data: aula,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao cancelar aula",
    });
  }
}