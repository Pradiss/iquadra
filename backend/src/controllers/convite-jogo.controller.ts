import { Response } from "express";

import { AuthRequest } from "../middlewares/auth.middleware";
import { convidarJogadorSchema } from "../schemas/convite-jogo.schema";
import {
  aceitarConviteJogo,
  convidarJogadorParaJogo,
  listarConvitesJogos,
  recusarConviteJogo,
} from "../services/convite-jogo.service";

export async function convidarJogadorController(
  req: AuthRequest,
  res: Response
) {
  try {
    const { id } = req.params;
    const data = convidarJogadorSchema.parse(req.body);

    const convite = await convidarJogadorParaJogo(req.user!.id, id, data);

    return res.status(201).json({
      success: true,
      message: "Convite enviado com sucesso",
      data: convite,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao enviar convite",
    });
  }
}

export async function listarConvitesJogosController(
  req: AuthRequest,
  res: Response
) {
  try {
    const convites = await listarConvitesJogos(req.user!.id);

    return res.json({
      success: true,
      total: convites.length,
      data: convites,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao listar convites",
    });
  }
}

export async function aceitarConviteJogoController(
  req: AuthRequest,
  res: Response
) {
  try {
    const { id } = req.params;

    const convite = await aceitarConviteJogo(req.user!.id, id);

    return res.json({
      success: true,
      message: "Convite aceito com sucesso",
      data: convite,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao aceitar convite",
    });
  }
}

export async function recusarConviteJogoController(
  req: AuthRequest,
  res: Response
) {
  try {
    const { id } = req.params;

    const convite = await recusarConviteJogo(req.user!.id, id);

    return res.json({
      success: true,
      message: "Convite recusado",
      data: convite,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao recusar convite",
    });
  }
}