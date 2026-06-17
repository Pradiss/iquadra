"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import api from "@/services/api";
import { ConfigJogador } from "@/components/configuracoes/config-jogador";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  foto_perfil?: string | null;
  perfil_cliente?: {
    categoria?: string;
    cidade?: string;
    cep?: string;
  } | null;
  perfil_professor?: {
    cidade?: string;
    bio?: string;
    especialidades?: string;
  } | null;
  academias?: {
    id: string;
    nome?: string;
    cidade?: string;
    estado?: string;
  }[];
};

function getData<T>(response: { data: unknown }): T {
  const data = response.data as { data?: T };
  return data.data ?? (response.data as T);
}

export default function ConfiguracoesJogadorPage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarUsuario() {
      try {
        const response = await api.get("/users/me");
        const data = getData<Usuario>(response);
        setUsuario(data);
      } catch {
        setUsuario(null);
      } finally {
        setLoading(false);
      }
    }

    void carregarUsuario();
  }, []);

  const isJogador = !!usuario?.perfil_cliente;

  return (
    <section className="mx-auto max-w-3xl">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-2 inline-flex items-center text-sm font-bold text-zinc-500 hover:text-zinc-950"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </button>

      {loading && (
        <p className="mt-5 rounded-2xl bg-white p-5 text-sm text-zinc-500">
          Carregando configuracoes...
        </p>
      )}

      {!loading && !usuario && (
        <p className="mt-5 rounded-2xl bg-white p-5 text-sm text-red-600">
          Nao foi possivel carregar seus dados.
        </p>
      )}

      {usuario && (
        <div className="mt-3 space-y-5">
          {isJogador && <ConfigJogador usuario={usuario} />}
        </div>
      )}
    </section>
  );
}
