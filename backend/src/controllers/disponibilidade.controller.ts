import { Request, Response } from "express";
import { getOptionalQueryString, getRouteParam } from "../lib/http";
import { getDisponibilidadeQuadra } from "../services/disponibilidade.service";

export async function getDisponibilidadeQuadraController(
  req: Request,
  res: Response
) {
  try {
    const id = getRouteParam(req.params.id, "id");
    const data = getOptionalQueryString(req.query.data);

    if (!data) {
      return res.status(400).json({
        success: false,
        message: "Informe a data no formato YYYY-MM-DD",
      });
    }

    const disponibilidade = await getDisponibilidadeQuadra(id, data);

    return res.json({
      success: true,
      data: disponibilidade,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao consultar disponibilidade",
    });
  }
}
