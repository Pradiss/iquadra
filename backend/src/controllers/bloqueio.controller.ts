import { Response } from "express";

import { AuthRequest } from "../middlewares/auth.middleware";
import { createBloqueioSchema } from "../schemas/bloqueio.schema";
import {
  createBloqueio,
  deleteBloqueio,
  listBloqueiosByQuadra,
} from "../services/bloqueio.service";

export async function createBloqueioController(
  req: AuthRequest,
  res: Response
) {
  try {
    const { quadraId } = req.params;
    const data = createBloqueioSchema.parse(req.body);

    const bloqueio = await createBloqueio(req.user!.id, quadraId, data);

    return res.status(201).json({
      success: true,
      message: "Bloqueio criado com sucesso",
      data: bloqueio,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao criar bloqueio",
    });
  }
}

export async function listBloqueiosController(req: AuthRequest, res: Response) {
  try {
    const { quadraId } = req.params;

    const bloqueios = await listBloqueiosByQuadra(quadraId);

    return res.json({
      success: true,
      total: bloqueios.length,
      data: bloqueios,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao listar bloqueios",
    });
  }
}

export async function deleteBloqueioController(
  req: AuthRequest,
  res: Response
) {
  try {
    const { id } = req.params;

    await deleteBloqueio(req.user!.id, id);

    return res.json({
      success: true,
      message: "Bloqueio removido com sucesso",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao remover bloqueio",
    });
  }
}