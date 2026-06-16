import type { Request } from "express";
import { badRequest } from "../errors/app-error";

export function getRouteParam(req: Request, name: string) {
  const value = req.params[name];

  if (typeof value !== "string" || !value) {
    throw badRequest(`Parametro de rota invalido: ${name}`);
  }

  return value;
}
