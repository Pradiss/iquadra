import { api, unwrapData } from "./api"
import type {
  AgendaAcademiaResponse,
  DashboardResumoAcademia,
} from "../types/dashboard"

export async function buscarDashboardAcademia(academiaId: string) {
  const response = await api.get(`/dashboard/academias/${academiaId}`)
  return unwrapData<DashboardResumoAcademia>(response)
}

export async function buscarAgendaAcademia(academiaId: string, data: string) {
  const response = await api.get(`/dashboard/academias/${academiaId}/agenda`, {
    params: { data },
  })

  return unwrapData<AgendaAcademiaResponse>(response)
}
