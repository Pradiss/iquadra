import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getRequiredEnv } from "../lib/env";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

const jwtSecret = getRequiredEnv("JWT_SECRET");

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Token não informado",
    });
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = jwt.verify(
      token,
      jwtSecret
    ) as {
      sub: string;
      email: string;
    };

    req.user = {
      id: decoded.sub,
      email: decoded.email,
    };

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Token inválido",
    });
  }
}
