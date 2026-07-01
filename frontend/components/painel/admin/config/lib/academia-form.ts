import { onlyNumbers } from "@/lib/masks";
import type {
  AcademiaDetalhes,
  AtualizarAcademiaPayload,
} from "@/services/academia.service";

import { DURACOES_RESERVA } from "../constants";
import type { AcademiaForm } from "../types";
import { slugify } from "./formatters";

export const initialAcademiaForm: AcademiaForm = {
  nome: "",
  slug: "",
  cnpj: "",
  telefone: "",
  email: "",
  endereco: "",
  cidade: "",
  estado: "",
  cep: "",
  logo_url: "",
  duracoes_reserva_minutos: DURACOES_RESERVA,
};

export function createAcademiaForm(academia: AcademiaDetalhes): AcademiaForm {
  return {
    nome: academia.nome ?? "",
    slug: academia.slug ?? "",
    cnpj: academia.cnpj ?? "",
    telefone: academia.telefone ?? "",
    email: academia.email ?? "",
    endereco: academia.endereco ?? "",
    cidade: academia.cidade ?? "",
    estado: academia.estado ?? "",
    cep: academia.cep ?? "",
    logo_url: academia.logo_url ?? "",
    duracoes_reserva_minutos: academia.duracoes_reserva_minutos?.length
      ? academia.duracoes_reserva_minutos
      : DURACOES_RESERVA,
  };
}

export function mergeAcademiaForm(
  current: AcademiaForm,
  academia: AcademiaDetalhes,
): AcademiaForm {
  return {
    ...current,
    nome: academia.nome ?? current.nome,
    slug: academia.slug ?? current.slug,
    cnpj: academia.cnpj ?? "",
    telefone: academia.telefone ?? "",
    email: academia.email ?? "",
    endereco: academia.endereco ?? "",
    cidade: academia.cidade ?? "",
    estado: academia.estado ?? "",
    cep: academia.cep ?? "",
    logo_url: academia.logo_url ?? current.logo_url,
    duracoes_reserva_minutos: academia.duracoes_reserva_minutos?.length
      ? academia.duracoes_reserva_minutos
      : current.duracoes_reserva_minutos,
  };
}

export function validateAcademiaForm(form: AcademiaForm) {
  if (form.nome.trim().length < 3) return "Informe o nome da academia.";
  if (form.slug.trim().length < 3) return "Informe um slug valido.";
  if (form.cnpj && onlyNumbers(form.cnpj).length !== 14) {
    return "Informe um CNPJ valido.";
  }
  if (form.telefone && ![10, 11].includes(onlyNumbers(form.telefone).length)) {
    return "Informe um telefone valido.";
  }
  if (form.cep && onlyNumbers(form.cep).length !== 8) {
    return "Informe um CEP valido.";
  }
  if (form.estado && form.estado.trim().length !== 2) {
    return "Informe o estado com 2 letras.";
  }
  if (form.duracoes_reserva_minutos.length === 0) {
    return "Selecione pelo menos uma duracao de reserva.";
  }

  return "";
}

export function buildAcademiaPayload(
  form: AcademiaForm,
): AtualizarAcademiaPayload {
  return {
    nome: form.nome.trim(),
    slug: slugify(form.slug),
    cnpj: onlyNumbers(form.cnpj) || null,
    telefone: onlyNumbers(form.telefone) || null,
    email: form.email.trim().toLowerCase() || null,
    endereco: form.endereco.trim() || null,
    cidade: form.cidade.trim() || null,
    estado: form.estado.trim().toUpperCase() || null,
    cep: onlyNumbers(form.cep) || null,
    duracoes_reserva_minutos: form.duracoes_reserva_minutos,
  };
}
