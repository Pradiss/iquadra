import {
  getUsuario,
  type AcademiaUsuarioLogado,
} from "@/lib/auth-storage";
import { buscarUltimaAcademia, salvarUltimaAcademia } from "@/lib/last-academia";
import { getAdminAcademias } from "@/lib/user-role";

import type { AdminContext } from "../types";

export function getAcademiaId(vinculo?: AcademiaUsuarioLogado) {
  return vinculo?.academia_id ?? vinculo?.academia?.id ?? "";
}

export function getAdminConfigContext(): AdminContext | null {
  const usuario = getUsuario();
  const vinculos = getAdminAcademias(usuario);

  if (!usuario || vinculos.length === 0) return null;

  const ultimaAcademiaId = buscarUltimaAcademia();
  const vinculo =
    vinculos.find((item) => getAcademiaId(item) === ultimaAcademiaId) ??
    vinculos[0];
  const academiaId = getAcademiaId(vinculo);

  if (!academiaId) return null;

  salvarUltimaAcademia(academiaId);

  return {
    usuario,
    vinculo,
    academiaId,
    isDono: vinculo.perfil === "DONO",
  };
}
