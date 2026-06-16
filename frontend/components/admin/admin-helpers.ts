import axios from "axios";

import { getUsuario } from "@/lib/auth-storage";
import { buscarUltimaAcademia, salvarUltimaAcademia } from "@/lib/last-academia";
import { useMemo } from "react";

export type Feedback = {
  type: "success" | "error";
  message: string;
};

export type AcademiaPainel = {
  id: string;
  nome?: string;
};

type UsuarioAcademia = {
  academia_id?: string;
  status?: string;
  academia?: {
    id?: string;
    nome?: string;
  };
};

type UsuarioAdmin = {
  academias?: UsuarioAcademia[];
};

export const todayInput = new Date().toISOString().slice(0, 10);

export const diasSemana = [
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
  { value: 0, label: "Domingo" },
];
export function useAdminAcademia() {
  return useMemo(() => {
    const usuario = getUsuario() as UsuarioAdmin | null;
    const vinculos = Array.isArray(usuario?.academias)
      ? usuario.academias
      : [];

    if (vinculos.length === 0) return null;

    const ultimaAcademiaId = buscarUltimaAcademia();

    const normalizar = (vinculo?: UsuarioAcademia): AcademiaPainel | null => {
      const id = vinculo?.academia_id ?? vinculo?.academia?.id;

      if (!id) return null;

      return {
        id,
        nome: vinculo?.academia?.nome,
      };
    };

    const academiaSalva = normalizar(
      vinculos.find(
        (vinculo) =>
          vinculo.academia_id === ultimaAcademiaId ||
          vinculo.academia?.id === ultimaAcademiaId
      )
    );

    const academiaAtiva = normalizar(
      vinculos.find((vinculo) => vinculo.status === "ATIVO")
    );

    const academia = academiaSalva ?? academiaAtiva ?? normalizar(vinculos[0]);

    if (academia) {
      salvarUltimaAcademia(academia.id);
    }

    return academia;
  }, []);
}
export function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ message?: string; errors?: { message?: string }[] }>(
    error
  )) {
    return (
      error.response?.data?.errors?.[0]?.message ||
      error.response?.data?.message ||
      fallback
    );
  }

  return fallback;
}

export function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function isPeriodoValido(inicio: string, fim: string) {
  return Boolean(inicio && fim && timeToMinutes(fim) > timeToMinutes(inicio));
}

export function getDiaSemanaLabel(value: number) {
  return diasSemana.find((dia) => dia.value === value)?.label ?? String(value);
}