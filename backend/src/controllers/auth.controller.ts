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

export async function registerClienteController(req: Request, res: Response) {
  const data = registerClienteSchema.parse(req.body);
  const usuario = await registerCliente(data);

  return res.status(201).json({
    success: true,
    message: "Cliente cadastrado com sucesso",
    data: usuario,
  });
}

export async function registerProfessorController(req: Request, res: Response) {
  const data = registerProfessorSchema.parse(req.body);
  const usuario = await registerProfessor(data);

  return res.status(201).json({
    success: true,
    message: "Professor cadastrado com sucesso",
    data: usuario,
  });
}

export async function registerAcademiaController(req: Request, res: Response) {
  const data = registerAcademiaSchema.parse(req.body);
  const result = await registerAcademia(data);

  return res.status(201).json({
    success: true,
    message: "Academia cadastrada com sucesso",
    data: result,
  });
}

export async function loginController(req: Request, res: Response) {
  const data = loginSchema.parse(req.body);
  const result = await loginUser(data);

  return res.json({
    success: true,
    message: "Login realizado com sucesso",
    data: result,
  });
}
