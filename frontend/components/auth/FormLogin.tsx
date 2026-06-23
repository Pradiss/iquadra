"use client";

import api from "@/services/api";
import axios from "axios";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import AuthCard from "./AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UsuarioLogado } from "@/lib/auth-storage";
import {
  
  persistAuthenticatedUsuario,
} from "@/lib/auth-flow";

function getSuccessMessage(created?: string | null) {
  if (created === "jogador") {
    return "Conta criada com sucesso. Agora é só entrar.";
  }

  if (created === "professor") {
    return "Cadastro de professor criado. Entre para continuar.";
  }

  if (created === "academia") {
    return "Academia cadastrada. Entre com o e-mail e a senha que você acabou de criar.";
  }

  return "";
}

type LoginResponse = {
  success: boolean;
  message: string;
  data: {
    usuario: UsuarioLogado;
  };
};

export default function FormLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const successMessage = getSuccessMessage(searchParams.get("created"));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    const dados = {
      email: String(formData.get("email")).trim().toLowerCase(),
      senha: String(formData.get("senha")),
    };

    try {
      const response = await api.post<LoginResponse>("/auth/login", dados);
      const { usuario } = response.data.data;

    persistAuthenticatedUsuario(usuario);

router.replace("/painel/jogador");

     
  

  return (
    <AuthCard
      title="Bora pro Play!"
      description="Acesse sua conta para reservar quadras, participar dos jogos e acompanhar a sua academia."
    >
      {successMessage && (
        <p className="mb-4 rounded-xl bg-lime-50 px-4 py-3 text-sm font-medium text-lime-700">
          {successMessage}
        </p>
      )}

      {erro && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {erro}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-gray-700">
            E-mail
          </span>

          <Input
            name="email"
            type="email"
            className="h-[50px] rounded-xl bg-gray-50 px-4 text-base"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-gray-700">
            Senha
          </span>

          <Input
            name="senha"
            type="password"
            className="h-[50px] rounded-xl bg-gray-50 px-4 text-base"
          />
        </label>

        <Button
          type="submit"
          disabled={loading}
          className="mt-1 h-[50px] w-full rounded-xl bg-gray-900 text-[15px] font-semibold text-white hover:bg-black disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <p className="mt-7 text-center text-[13px] text-gray-400">
        Ainda não tem uma conta?{" "}
        <button
          type="button"
          onClick={() => router.push("/cadastro/jogador")}
          className="font-semibold text-gray-700 hover:underline"
        >
          Criar conta
        </button>
      </p>

      <button
        type="button"
        onClick={() => router.push("/cadastro/academia")}
        className="mt-5 w-full rounded-2xl border border-lime-200 bg-lime-50 px-4 py-3 text-sm font-semibold text-lime-900 hover:bg-lime-100"
      >
        Administra uma academia? <br />
        Criar acesso de proprietário
      </button>
    </AuthCard>
  );
}
