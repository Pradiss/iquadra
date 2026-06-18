import axios from "axios";

import { getUsuario, type AcademiaUsuarioLogado } from "@/lib/auth-storage";
import { getAdminAcademias } from "@/lib/user-role";
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

type UsuarioAdmin = {
  academias?: AcademiaUsuarioLogado[];
};

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export const todayInput = formatDateInput(new Date());

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
    const vinculos = getAdminAcademias(usuario);

    if (vinculos.length === 0) return null;

    const ultimaAcademiaId = buscarUltimaAcademia();

    const normalizar = (
      vinculo?: AcademiaUsuarioLogado
    ): AcademiaPainel | null => {
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
