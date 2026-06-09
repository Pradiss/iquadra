export function getRouteParam(
  value: string | string[] | undefined,
  name: string
) {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) {
    return value[0];
  }

  throw new Error(`Parametro de rota invalido: ${name}`);
}

export function getOptionalQueryString(value: unknown) {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) {
    return value[0];
  }

  return undefined;
}
