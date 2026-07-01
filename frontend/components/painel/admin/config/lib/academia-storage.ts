import { getUsuario, updateStoredUsuario } from "@/lib/auth-storage";
import type { AcademiaDetalhes } from "@/services/academia.service";

import { getAcademiaId } from "./admin-context";

export function clearAcademiasCache() {
  try {
    window.localStorage.removeItem("playfy_academias_cache:v2");
  } catch {
    // localStorage can be unavailable in private or restricted browser modes.
  }
}

export function mergeAcademiaNoUsuario(academia: AcademiaDetalhes) {
  const usuario = getUsuario();

  if (!usuario?.academias) return;

  updateStoredUsuario({
    ...usuario,
    academias: usuario.academias.map((vinculo) => {
      if (getAcademiaId(vinculo) !== academia.id) return vinculo;

      return {
        ...vinculo,
        academia: {
          ...vinculo.academia,
          id: academia.id,
          nome: academia.nome,
          slug: academia.slug,
          cidade: academia.cidade,
          estado: academia.estado,
          status: academia.status,
        },
      };
    }),
  });
}
