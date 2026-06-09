import { Request, Response } from "express";

import { getRouteParam } from "../lib/http";
import { AuthRequest } from "../middlewares/auth.middleware";
import { createJogoSchema } from "../schemas/jogo.schema";
import {
  cancelarJogo,
  createJogo,
  getJogoById,
  listJogos,
  participarJogo,
  sairJogo,
} from "../services/jogo.service";

export async function createJogoController(req: AuthRequest, res: Response) {
  try {
    const data = createJogoSchema.parse(req.body);

    const jogo = await createJogo(req.user!.id, data);

    return res.status(201).json({
      success: true,
      message: "Jogo criado com sucesso",
      data: jogo,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao criar jogo",
    });
  }
}

export async function listJogosController(req: Request, res: Response) {
  try {
    const { academia_id, data, status } = req.query;

    const jogos = await listJogos({
      academia_id: academia_id as string | undefined,
      data: data as string | undefined,
      status: status as any,
    });

    return res.json({
      success: true,
      total: jogos.length,
      data: jogos,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao listar jogos",
    });
  }
}

export async function getJogoController(req: Request, res: Response) {
  try {
    const id = getRouteParam(req.params.id, "id");

    const jogo = await getJogoById(id);

    return res.json({
      success: true,
      data: jogo,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message || "Jogo não encontrado",
    });
  }
}

export async function participarJogoController(req: AuthRequest, res: Response) {
  try {
    const id = getRouteParam(req.params.id, "id");

    const jogo = await participarJogo(req.user!.id, id);

    return res.json({
      success: true,
      message: "Você entrou no jogo",
      data: jogo,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao participar do jogo",
    });
  }
}

export async function sairJogoController(req: AuthRequest, res: Response) {
  try {
    const id = getRouteParam(req.params.id, "id");

    const jogo = await sairJogo(req.user!.id, id);

    return res.json({
      success: true,
      message: "Você saiu do jogo",
      data: jogo,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao sair do jogo",
    });
  }
}

export async function cancelarJogoController(req: AuthRequest, res: Response) {
  try {
    const id = getRouteParam(req.params.id, "id");

    const jogo = await cancelarJogo(req.user!.id, id);

    return res.json({
      success: true,
      message: "Jogo cancelado com sucesso",
      data: jogo,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao cancelar jogo",
    });
  }
}
