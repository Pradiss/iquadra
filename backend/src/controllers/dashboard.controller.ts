import { Response } from "express";

import { AuthRequest } from "../middlewares/auth.middleware";
import {
  getAgendaAcademia,
  getDashboardAcademia,
} from "../services/dashboard.service";

export async function getDashboardAcademiaController(
  req: AuthRequest,
  res: Response
) {
  try {
    const { academiaId } = req.params;

    const dashboard = await getDashboardAcademia(req.user!.id, academiaId);

    return res.json({
      success: true,
      data: dashboard,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao buscar dashboard",
    });
  }
}

export async function getAgendaAcademiaController(
  req: AuthRequest,
  res: Response
) {
  try {
    const { academiaId } = req.params;
    const { data } = req.query;

    if (!data || typeof data !== "string") {
      return res.status(400).json({
        success: false,
        message: "Informe a data no formato YYYY-MM-DD",
      });
    }

    const agenda = await getAgendaAcademia(req.user!.id, academiaId, data);

    return res.json({
      success: true,
      data: agenda,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao buscar agenda da academia",
    });
  }
}