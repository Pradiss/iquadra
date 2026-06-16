"use client";

import { Save } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import api from "@/services/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSafeImageUrl } from "@/lib/safe-image";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  telefone?: string | null;
  foto_perfil?: string | null;
  perfil_cliente?: {
    categoria?: string;
    cidade?: string;
    cep?: string;
  } | null;
};

type Props = {
  usuario: Usuario;
};

function getInitials(nome?: string) {
  if (!nome) return "IQ";

  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");
}

function getData<T>(response: { data: unknown }): T {
  const data = response.data as { data?: T; user?: T };
  return data.data ?? data.user ?? (response.data as T);
}

export function ConfigJogador({ usuario }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [form, setForm] = useState({
    nome: usuario.nome ?? "",
    email: usuario.email ?? "",
    telefone: usuario.telefone ?? "",
    foto_perfil: usuario.foto_perfil ?? "",
    cidade: usuario.perfil_cliente?.cidade ?? "",
    cep: usuario.perfil_cliente?.cep ?? "",
    categoria: usuario.perfil_cliente?.categoria ?? "",
  });

  const fotoSegura = getSafeImageUrl(form.foto_perfil);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function salvar() {
    setErro("");
    setSucesso("");
    setLoading(true);

    try {
      const response = await api.put("/users/me", {
        nome: form.nome.trim(),
        email: form.email.trim().toLowerCase(),
        telefone: form.telefone.trim(),
        foto_perfil: form.foto_perfil.trim() || undefined,
        perfil_cliente: {
          cidade: form.cidade.trim(),
          cep: form.cep.trim(),
          categoria: form.categoria,
        },
      });

      const usuarioAtualizado = getData<Usuario>(response);

      localStorage.setItem("usuario", JSON.stringify(usuarioAtualizado));

      setSucesso("Dados atualizados com sucesso.");

      setTimeout(() => {
        router.push("/painel/jogador/perfil");
      }, 500);
    } catch {
      setErro("Não foi possível atualizar as informações do perfil.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[32px] bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-xl font-black text-zinc-950">Dados do jogador</h2>

      <p className="mt-1 text-sm text-zinc-500">
        Edite sua foto, dados básicos e ranking.
      </p>

      {erro && (
        <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {erro}
        </p>
      )}

      {sucesso && (
        <p className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {sucesso}
        </p>
      )}

      <div className="mt-6 flex flex-col items-center rounded-[28px] bg-zinc-50 p-5">
        <Avatar className="h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-green-100 shadow-[0_14px_40px_rgba(15,23,42,0.14)]">
          {fotoSegura && (
            <AvatarImage
              src={fotoSegura}
              alt={form.nome}
              className="h-full w-full rounded-full object-cover"
            />
          )}

          <AvatarFallback className="h-full w-full rounded-full bg-green-100 text-3xl font-black text-green-800">
            {getInitials(form.nome)}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="mt-6 grid gap-4">
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
            value={form.telefone}
            onChange={(event) => updateField("telefone", event.target.value)}
            className="h-[50px] rounded-xl bg-zinc-50"
          />
        </Campo>

        <Campo label="URL da foto">
          <Input
            value={form.foto_perfil}
            onChange={(event) => updateField("foto_perfil", event.target.value)}
            placeholder="https://..."
            className="h-[50px] rounded-xl bg-zinc-50"
          />
        </Campo>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Cidade">
            <Input
              value={form.cidade}
              onChange={(event) => updateField("cidade", event.target.value)}
              className="h-[50px] rounded-xl bg-zinc-50"
            />
          </Campo>

          <Campo label="CEP">
            <Input
              value={form.cep}
              onChange={(event) => updateField("cep", event.target.value)}
              className="h-[50px] rounded-xl bg-zinc-50"
            />
          </Campo>
        </div>

        <Campo label="Ranking">
          <select
            value={form.categoria}
            onChange={(event) => updateField("categoria", event.target.value)}
            className="h-[50px] w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none focus:border-green-600"
          >
            <option value="">Selecione</option>
            <option value="INICIANTE">Iniciante</option>
            <option value="D">D</option>
            <option value="C">C</option>
            <option value="B">B</option>
            <option value="A">A</option>
          </select>
        </Campo>

        <Button
          type="button"
          disabled={loading}
          onClick={salvar}
          className="mt-2 h-[50px] rounded-2xl bg-zinc-950 font-bold text-white hover:bg-black"
        >
          <Save className="mr-2 h-4 w-4" />
          {loading ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
    </div>
  );
}

function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-zinc-700">
        {label}
      </span>

      {children}
    </label>
  );
}
