import type { NextFunction, Request, Response } from "express";

import {
  ACCESS_TOKEN_COOKIE,
  CSRF_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  getAuthCookie,
} from "../lib/auth-cookies";
import { forbidden } from "../errors/app-error";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const CSRF_EXEMPT_PATHS = [
  "/auth/login",
  "/auth/register/cliente",
  "/auth/register/professor",
  "/auth/register/academia",
  "/auth/logout",
];

export function csrfMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  if (!MUTATING_METHODS.has(req.method) || CSRF_EXEMPT_PATHS.includes(req.path)) {
    return next();
  }

  if (hasBearerToken(req)) {
    return next();
  }

  const accessToken = getAuthCookie(req, ACCESS_TOKEN_COOKIE);
  const refreshToken = getAuthCookie(req, REFRESH_TOKEN_COOKIE);

  if (!accessToken && !refreshToken) {
    return next();
  }

  const csrfCookie = getAuthCookie(req, CSRF_TOKEN_COOKIE);
  const csrfHeader = req.header("x-csrf-token");

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return next(forbidden("Token CSRF invalido"));
  }

  return next();
}

function hasBearerToken(req: Request) {
  const authHeader = req.headers.authorization;

  return typeof authHeader === "string" && authHeader.startsWith("Bearer ");
}
