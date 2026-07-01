"use client";

import { Save, Trash2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AVATAR_ACCEPT } from "@/lib/avatar-upload";
import { maskPhone } from "@/lib/masks";
import type { UsuarioLogado } from "@/lib/auth-storage";

import { getInitials } from "../lib/formatters";
import { useConfigPerfil } from "../hooks/useConfigPerfil";
import { Campo } from "./Campo";
import { Feedback } from "./Feedback";
import { FileName } from "./FileName";

export function ConfigPerfil({ usuario }: { usuario: UsuarioLogado }) {
  const {
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
  } = useConfigPerfil(usuario);

  return (
    <section className="rounded-[28px] bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-xl font-black text-zinc-950">Perfil</h2>

      <Feedback erro={erro} sucesso={sucesso} />

      <div className="mt-5 flex flex-col items-center rounded-[24px] bg-zinc-50 p-5">
        <Avatar className="h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-green-100 shadow-sm">
          {fotoSegura && (
            <AvatarImage
              src={fotoSegura}
              alt={form.nome}
              className="h-full w-full rounded-full object-cover"
            />
          )}

          <AvatarFallback className="h-full w-full rounded-full bg-green-100 text-2xl font-black text-green-800">
            {getInitials(form.nome)}
          </AvatarFallback>
        </Avatar>

        <div className="mt-5 grid w-full gap-3 sm:grid-cols-[1fr_auto]">
          <Campo label="Foto de perfil">
            <Input
              type="file"
              accept={AVATAR_ACCEPT}
              onChange={handleAvatarChange}
              className="h-[50px] rounded-xl bg-white pt-3"
            />
          </Campo>

          <Button
            type="button"
            variant="outline"
            disabled={removingAvatar || loading || !fotoSegura}
            onClick={removerFoto}
            className="self-end h-[50px] rounded-xl border-red-100 bg-white font-bold text-red-600 hover:bg-red-50"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {removingAvatar ? "Removendo..." : "Remover"}
          </Button>
        </div>

        {avatarFile && <FileName name={avatarFile.name} />}
      </div>

      <div className="mt-5 grid gap-4">
        <Campo label="Nome">
          <Input
            value={form.nome}
            onChange={(event) => updateField("nome", event.target.value)}
            className="h-[50px] rounded-xl bg-zinc-50"
          />
        </Campo>

        <Campo label="E-mail">
          <Input
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            className="h-[50px] rounded-xl bg-zinc-50"
          />
        </Campo>

        <Campo label="Telefone">
          <Input
            value={maskPhone(form.telefone)}
            onChange={(event) => updateField("telefone", event.target.value)}
            className="h-[50px] rounded-xl bg-zinc-50"
          />
        </Campo>

        <Button
          type="button"
          disabled={loading || removingAvatar}
          onClick={salvarPerfil}
          className="h-[50px] rounded-2xl bg-zinc-950 font-bold text-white hover:bg-black"
        >
          <Save className="mr-2 h-4 w-4" />
          {loading ? "Salvando..." : "Salvar perfil"}
        </Button>
      </div>
    </section>
  );
}
