"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";

import { getSafeImageUrl } from "@/lib/safe-image";
import {
  atualizarAcademia,
  buscarAcademia,
  uploadAcademiaLogoFile,
  validateAcademiaLogoFile,
  type AcademiaDetalhes,
  type DuracaoReserva,
} from "@/services/academia.service";

import { DURACOES_RESERVA } from "../constants";
import type { AcademiaForm } from "../types";
import {
  clearAcademiasCache,
  mergeAcademiaNoUsuario,
} from "../lib/academia-storage";
import {
  buildAcademiaPayload,
  createAcademiaForm,
  initialAcademiaForm,
  mergeAcademiaForm,
  validateAcademiaForm,
} from "../lib/academia-form";

export function useConfigAcademia(academiaId: string) {
  const [form, setForm] = useState<AcademiaForm>(initialAcademiaForm);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const logoPreview = useMemo(
    () => (logoFile ? URL.createObjectURL(logoFile) : ""),
    [logoFile],
  );
  const logoSegura = logoPreview || getSafeImageUrl(form.logo_url);

  useEffect(() => {
    if (!logoPreview) return;

    return () => {
      URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  useEffect(() => {
    async function carregarAcademia() {
      try {
        setLoading(true);
        const academia = await buscarAcademia(academiaId);
        setForm(createAcademiaForm(academia));
      } catch {
        setErro("Nao foi possivel carregar os dados da academia.");
      } finally {
        setLoading(false);
      }
    }

    void carregarAcademia();
  }, [academiaId]);

  function updateField(field: keyof AcademiaForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function toggleDuracao(duracao: DuracaoReserva, checked: boolean) {
    setForm((current) => {
      const duracoes = checked
        ? [...current.duracoes_reserva_minutos, duracao]
        : current.duracoes_reserva_minutos.filter((item) => item !== duracao);

      return {
        ...current,
        duracoes_reserva_minutos: DURACOES_RESERVA.filter((item) =>
          duracoes.includes(item),
        ),
      };
    });
  }

  function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setLogoFile(null);
      return;
    }

    const error = validateAcademiaLogoFile(file);

    if (error) {
      setErro(error);
      event.target.value = "";
      setLogoFile(null);
      return;
    }

    setErro("");
    setSucesso("");
    setLogoFile(file);
  }

  async function salvarAcademia() {
    const validationError = validateAcademiaForm(form);

    if (validationError) {
      setErro(validationError);
      return;
    }

    setErro("");
    setSucesso("");
    setSaving(true);

    try {
      let academia = await atualizarAcademia(
        academiaId,
        buildAcademiaPayload(form),
      );

      if (logoFile) {
        academia = await uploadAcademiaLogoFile<AcademiaDetalhes>(
          academiaId,
          logoFile,
        );
      }

      setLogoFile(null);
      setForm((current) => mergeAcademiaForm(current, academia));
      mergeAcademiaNoUsuario(academia);
      clearAcademiasCache();
      setSucesso("Academia atualizada com sucesso.");
    } catch {
      setErro("Nao foi possivel atualizar a academia.");
    } finally {
      setSaving(false);
    }
  }

  return {
    form,
    logoFile,
    loading,
    saving,
    erro,
    sucesso,
    logoSegura,
    updateField,
    toggleDuracao,
    handleLogoChange,
    salvarAcademia,
  };
}
