import type { Request, Response } from "express";

import {
  loginSchema,
  registerAcademiaSchema,
  registerClienteSchema,
  registerProfessorSchema,
} from "../schemas/auth.schema";

import {
  loginUser,
  registerAcademia,
  registerCliente,
  registerProfessor,
} from "../services/auth.service";
import { clearAuthCookies, setAuthCookies } from "../lib/auth-cookies";

export async function registerClienteController(req: Request, res: Response) {
  const data = registerClienteSchema.parse(req.body);
  const result = await registerCliente(data);

  setAuthCookies(res, result.session);

  return res.status(201).json({
    success: true,
    message: "Cliente cadastrado com sucesso",
    data: {
      usuario: result.usuario,
    },
  });
}

export async function registerProfessorController(req: Request, res: Response) {
  const data = registerProfessorSchema.parse(req.body);
  const result = await registerProfessor(data);

  setAuthCookies(res, result.session);

  return res.status(201).json({
    success: true,
    message: "Professor cadastrado com sucesso",
    data: {
      usuario: result.usuario,
    },
  });
}

export async function registerAcademiaController(req: Request, res: Response) {
  const data = registerAcademiaSchema.parse(req.body);
  const result = await registerAcademia(data);

  setAuthCookies(res, result.session);

  return res.status(201).json({
    success: true,
    message: "Academia cadastrada com sucesso",
    data: {
      usuario: result.usuario,
      academia: result.academia,
    },
  });
}

export async function loginController(req: Request, res: Response) {
  const data = loginSchema.parse(req.body);
  const result = await loginUser(data);

  setAuthCookies(res, result.session, {
    persistent: data.manterLogado,
  });

  return res.json({
    success: true,
    message: "Login realizado com sucesso",
    data: {
      usuario: result.usuario,
    },
  });
}

export async function logoutController(_req: Request, res: Response) {
  clearAuthCookies(res);

  return res.json({
    success: true,
    message: "Logout realizado com sucesso",
  });
}
