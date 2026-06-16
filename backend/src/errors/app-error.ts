export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(message: string, statusCode = 400, code = "BAD_REQUEST") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function badRequest(message = "Requisicao invalida") {
  return new AppError(message, 400, "BAD_REQUEST");
}

export function unauthorized(message = "Nao autenticado") {
  return new AppError(message, 401, "UNAUTHORIZED");
}

export function forbidden(message = "Acesso negado") {
  return new AppError(message, 403, "FORBIDDEN");
}

export function notFound(message = "Recurso nao encontrado") {
  return new AppError(message, 404, "NOT_FOUND");
}
