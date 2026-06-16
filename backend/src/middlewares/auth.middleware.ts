import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { unauthorized } from "../errors/app-error";
import { prisma } from "../lib/prisma";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

type JwtPayload = {
  sub: string;
  email: string;
};

export function authMiddleware(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(unauthorized("Token nao informado"));
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(unauthorized("Formato de token invalido"));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ["HS256"],
    }) as JwtPayload;

    if (!decoded.sub || !decoded.email) {
      return next(unauthorized("Token invalido"));
    }

    prisma.usuario
      .findUnique({
        where: {
          id: decoded.sub,
        },
        select: {
          id: true,
          email: true,
          status: true,
        },
      })
      .then((usuario) => {
        if (!usuario || usuario.status !== "ATIVO") {
          return next(unauthorized("Usuario inativo ou nao encontrado"));
        }

        req.user = {
          id: usuario.id,
          email: usuario.email,
        };

        return next();
      })
      .catch(next);
  } catch {
    return next(unauthorized("Token invalido"));
  }
}
