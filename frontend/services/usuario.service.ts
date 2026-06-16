import api from "@/services/api";

function getData<T>(response: { data: unknown }): T {
  const data = response.data as { data?: T };
  return data.data ?? (response.data as T);
}

export async function listarUsuarios() {
  const response = await api.get("/users");
  return getData(response);
}