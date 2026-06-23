import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { env } from "../config/env";
import { AppError } from "../errors/app-error";

type PrismaKnownError = Error & {
  code?: string;
  meta?: Record<string, unknown>;
};

type UploadError = Error & {
  code?: string;
};

function isBodyParserError(error: unknown) {
  return (
    error instanceof SyntaxError &&
    typeof (error as { status?: unknown }).status === "number" &&
    "body" in (error as object)
  );
}

function isPrismaUniqueError(error: unknown): error is PrismaKnownError {
  return (
    error instanceof Error &&
    (error as PrismaKnownError).code === "P2002"
  );
}

function isUploadError(error: unknown): error is UploadError {
  return (
    error instanceof Error &&
    typeof (error as UploadError).code === "string" &&
    (error as UploadError).code!.startsWith("LIMIT_")
  );
}

export function notFoundMiddleware(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(`Rota nao encontrada: ${req.method} ${req.path}`, 404, "NOT_FOUND"));
}

export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      code: "VALIDATION_ERROR",
      message: "Dados invalidos",
      errors: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (isBodyParserError(error)) {
    return res.status(400).json({
      success: false,
      code: "INVALID_JSON",
      message: "JSON invalido",
    });
  }

  if (isPrismaUniqueError(error)) {
    return res.status(409).json({
      success: false,
      code: "CONFLICT",
      message: "Registro ja existe",
    });
  }

  if (isUploadError(error)) {
    return res.status(400).json({
      success: false,
      code: "UPLOAD_ERROR",
      message:
        error.code === "LIMIT_FILE_SIZE"
          ? "Imagem muito grande"
          : error.message,
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      code: error.code,
      message: error.message,
    });
  }

  if (error instanceof Error && error.constructor === Error) {
    return res.status(400).json({
      success: false,
      code: "BAD_REQUEST",
      message: error.message || "Requisicao invalida",
    });
  }

  if (env.NODE_ENV !== "test") {
    console.error(error);
  }

  return res.status(500).json({
    success: false,
    code: "INTERNAL_ERROR",
    message: "Erro interno do servidor",
  });
}
