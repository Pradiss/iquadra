import { Request, Response } from "express";

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
  try {
    const data = registerClienteSchema.parse(req.body);
    const usuario = await registerCliente(data);

    return res.status(201).json({
      success: true,
      message: "Cliente cadastrado com sucesso",
      data: usuario,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao cadastrar cliente",
    });
  }
}

export async function registerProfessorController(req: Request, res: Response) {
  try {
    const data = registerProfessorSchema.parse(req.body);
    const usuario = await registerProfessor(data);

    return res.status(201).json({
      success: true,
      message: "Professor cadastrado com sucesso",
      data: usuario,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao cadastrar professor",
    });
  }
}

export async function registerAcademiaController(req: Request, res: Response) {
  try {
    const data = registerAcademiaSchema.parse(req.body);
    const result = await registerAcademia(data);

    return res.status(201).json({
      success: true,
      message: "Academia cadastrada com sucesso",
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao cadastrar academia",
    });
  }
}

export async function loginController(req: Request, res: Response) {
  try {
    const data = loginSchema.parse(req.body);
    const result = await loginUser(data);

    return res.json({
      success: true,
      message: "Login realizado com sucesso",
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao fazer login",
    });
  }
}