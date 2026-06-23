import type { NextFunction, Request, Response } from "express";

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  getAuthCookie,
  setAuthCookies,
} from "../lib/auth-cookies";
import { unauthorized } from "../errors/app-error";
import { prisma } from "../lib/prisma";
import { supabaseAuth } from "../lib/supabase";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    supabaseUserId: string;
  };
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    req.user = await resolveAuthUser(req, res);

    return next();
  } catch (error) {
    return next(error);
  }
}

export async function optionalAuthMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!hasAuthCredentials(req)) {
    return next();
  }

  try {
    req.user = await resolveAuthUser(req, res);
  } catch {
    req.user = undefined;
  }

  return next();
}

async function resolveAuthUser(req: Request, res: Response) {
  const supabaseUser = await resolveSupabaseUser(req, res);

  if (!supabaseUser?.id || !supabaseUser.email) {
    throw unauthorized("Sessao invalida");
  }

  const usuario = await prisma.usuario.findFirst({
    where: {
      OR: [
        {
          supabaseUserId: supabaseUser.id,
        },
        {
          email: supabaseUser.email,
        },
      ],
    },
    select: {
      id: true,
      email: true,
      supabaseUserId: true,
      status: true,
    },
  });

  if (!usuario || usuario.status !== "ATIVO") {
    throw unauthorized("Usuario inativo ou nao encontrado");
  }

  let supabaseUserId = usuario.supabaseUserId;

  if (!supabaseUserId) {
    const updated = await prisma.usuario.update({
      where: {
        id: usuario.id,
      },
      data: {
        supabaseUserId: supabaseUser.id,
      },
      select: {
        supabaseUserId: true,
      },
    });

    supabaseUserId = updated.supabaseUserId;
  }

  if (!supabaseUserId) {
    throw unauthorized("Usuario sem vinculo Supabase");
  }

  return {
    id: usuario.id,
    email: usuario.email,
    supabaseUserId,
  };
}

async function resolveSupabaseUser(req: Request, res: Response) {
  const accessToken = getBearerToken(req) ?? getAuthCookie(req, ACCESS_TOKEN_COOKIE);
  const refreshToken = getAuthCookie(req, REFRESH_TOKEN_COOKIE);

  if (accessToken) {
    const { data, error } = await supabaseAuth.auth.getUser(accessToken);

    if (!error && data.user) {
      return data.user;
    }
  }

  if (!refreshToken) {
    throw unauthorized("Sessao nao informada");
  }

  const { data, error } = await supabaseAuth.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !data.session || !data.user) {
    throw unauthorized("Sessao expirada");
  }

  setAuthCookies(res, data.session);

  return data.user;
}

function getBearerToken(req: Request) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

function hasAuthCredentials(req: Request) {
  return Boolean(
    getBearerToken(req) ||
      getAuthCookie(req, ACCESS_TOKEN_COOKIE) ||
      getAuthCookie(req, REFRESH_TOKEN_COOKIE)
  );
}
