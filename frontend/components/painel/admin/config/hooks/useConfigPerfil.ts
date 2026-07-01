"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";

import { updateStoredUsuario, type UsuarioLogado } from "@/lib/auth-storage";
import {
  removeAvatarFile,
  uploadAvatarFile,
  validateAvatarFile,
} from "@/lib/avatar-upload";
import { onlyNumbers } from "@/lib/masks";
import { getSafeImageUrl } from "@/lib/safe-image";
import api from "@/services/api";

import type { PerfilForm } from "../types";
import { getResponseData } from "../lib/http";

export function useConfigPerfil(usuario: UsuarioLogado) {
  const [form, setForm] = useState<PerfilForm>({
    nome: usuario.nome ?? "",
    email: usuario.email ?? "",
    telefone: usuario.telefone ?? "",
    foto_perfil: usuario.foto_perfil ?? "",
    fotoUrl: usuario.fotoUrl ?? "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [removingAvatar, setRemovingAvatar] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const avatarPreview = useMemo(
    () => (avatarFile ? URL.createObjectURL(avatarFile) : ""),
    [avatarFile],
  );
  const fotoSegura =
    avatarPreview || getSafeImageUrl(form.foto_perfil || form.fotoUrl);

  useEffect(() => {
    if (!avatarPreview) return;

    return () => {
      URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  function updateField(field: keyof PerfilForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setAvatarFile(null);
      return;
    }

    const error = validateAvatarFile(file);

    if (error) {
      setErro(error);
      event.target.value = "";
      setAvatarFile(null);
      return;
    }

    setErro("");
    setSucesso("");
    setAvatarFile(file);
  }

  async function salvarPerfil() {
    setErro("");
    setSucesso("");
    setLoading(true);

    try {
      const response = await api.put("/users/me", {
        nome: form.nome.trim(),
        email: form.email.trim().toLowerCase(),
        telefone: onlyNumbers(form.telefone),
      });

      let usuarioAtualizado = getResponseData<UsuarioLogado>(response);

      if (avatarFile) {
        usuarioAtualizado = await uploadAvatarFile<UsuarioLogado>(avatarFile);
      }

      updateStoredUsuario(usuarioAtualizado);
      setAvatarFile(null);
      setForm((current) => ({
        ...current,
        foto_perfil: usuarioAtualizado.foto_perfil ?? "",
        fotoUrl: usuarioAtualizado.fotoUrl ?? "",
      }));
      setSucesso("Perfil atualizado com sucesso.");
    } catch {
      setErro("Nao foi possivel atualizar o perfil.");
    } finally {
      setLoading(false);
    }
  }

  async function removerFoto() {
    setErro("");
    setSucesso("");
    setRemovingAvatar(true);

    try {
      const usuarioAtualizado = await removeAvatarFile<UsuarioLogado>();

      updateStoredUsuario(usuarioAtualizado);
      setAvatarFile(null);
      setForm((current) => ({
        ...current,
        foto_perfil: "",
        fotoUrl: "",
      }));
      setSucesso("Foto removida com sucesso.");
    } catch {
      setErro("Nao foi possivel remover a foto de perfil.");
    } finally {
      setRemovingAvatar(false);
    }
  }

  return {
    form,
    avatarFile,
    loading,
    removingAvatar,
    erro,
    sucesso,
    fotoSegura,
    updateField,
    handleAvatarChange,
    salvarPerfil,
    removerFoto,
  };
}
