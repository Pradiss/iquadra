"use client";

import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";

import api from "@/services/api";
import AuthCard from "./AuthCard";
import { maskCep, maskPhone, onlyNumbers } from "@/lib/masks";
import {
  AVATAR_ACCEPT,
  uploadAvatarFile,
  validateAvatarFile,
} from "@/lib/avatar-upload";
import {
  getRedirectAfterAuth,
  persistAuthenticatedUsuario,
} from "@/lib/auth-flow";
import type { UsuarioLogado } from "@/lib/auth-storage";

import {
  CATEGORIAS_USUARIO,
  isCategoriaUsuario,
  type CategoriaUsuario,
} from "@/lib/categoria-usuario";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CadastroData = {
  nome: string;
  telefone: string;
  cidade: string;
  cep: string;
  categoria: CategoriaUsuario | "";
  email: string;
  senha: string;
};

type CadastroResponse = {
  success: boolean;
  message: string;
  data: {
    usuario: UsuarioLogado;
  };
};

const initialData: CadastroData = {
  nome: "",
  telefone: "",
  cidade: "",
  cep: "",
  categoria: "",
  email: "",
  senha: "",
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getCategoriaLabel(categoria: CategoriaUsuario) {
  return categoria === "INICIANTE" ? "Iniciante" : categoria;
}

function cleanPayload(data: CadastroData) {
  if (!isCategoriaUsuario(data.categoria)) {
    throw new Error("Categoria inválida.");
  }

  return {
    nome: data.nome.trim(),
    email: data.email.trim().toLowerCase(),
    telefone: onlyNumbers(data.telefone),
    senha: data.senha,
    categoria: data.categoria,
    cidade: data.cidade.trim(),
    cep: onlyNumbers(data.cep),
  };
}

export default function FormCadastroJogador() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CadastroData>(initialData);
  const [avatar, setAvatar] = useState<File | null>(null);

  function updateField<K extends keyof CadastroData>(
    field: K,
    value: CadastroData[K]
  ) {
    setData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function validateStep() {
    if (step === 1) {
      if (data.nome.trim().length < 3) return "Informe seu nome completo.";
      if (onlyNumbers(data.telefone).length < 10)
        return "Informe um telefone válido.";
      if (data.cidade.trim().length < 2) return "Informe sua cidade.";
      if (onlyNumbers(data.cep).length !== 8) return "Informe um CEP válido.";
    }

    if (step === 2 && !data.categoria) {
      return "Selecione sua categoria.";
    }

    if (step === 3) {
      if (!isValidEmail(data.email)) return "Informe um e-mail válido.";
      if (data.senha.length < 8)
        return "A senha precisa ter pelo menos 8 caracteres.";
    }

    return "";
  }

  function nextStep() {
    const error = validateStep();

    if (error) {
      setErro(error);
      return;
    }

    setErro("");
    setStep((current) => current + 1);
  }

  function previousStep() {
    setErro("");
    setStep((current) => current - 1);
  }

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setAvatar(null);
      return;
    }

    const error = validateAvatarFile(file);

    if (error) {
      setErro(error);
      event.target.value = "";
      setAvatar(null);
      return;
    }

    setErro("");
    setAvatar(file);
  }

  async function handleSubmit() {
    const error = validateStep();

    if (error) {
      setErro(error);
      return;
    }

    setErro("");
    setLoading(true);

    try {
      const response = await api.post<CadastroResponse>(
        "/auth/register/cliente",
        cleanPayload(data)
      );
      let usuario = response.data.data.usuario;

      if (avatar) {
        try {
          usuario = await uploadAvatarFile(avatar);
        } catch {
          persistAuthenticatedUsuario(usuario);
          setErro(
            "Conta criada, mas nao foi possivel enviar a foto de perfil."
          );
          router.replace(getRedirectAfterAuth(usuario));
          return;
        }
      }

      persistAuthenticatedUsuario(usuario);
      router.replace(getRedirectAfterAuth(usuario));
    } catch (error) {
      if (axios.isAxiosError<{ message?: string }>(error)) {
        setErro(
          error.response?.data?.message || "Não foi possível criar sua conta."
        );
      } else if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro("Não foi possível criar sua conta.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Criar conta" description={`Etapa ${step} de 3`}>
      <div className="mb-6 flex gap-1.5">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className={`h-[3px] flex-1 rounded-full transition ${
              item <= step ? "bg-gray-900" : "bg-black/10"
            }`}
          />
        ))}
      </div>

      {erro && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {erro}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {step === 1 && (
          <>
            <Campo label="Nome completo">
              <Input
                value={data.nome}
                onChange={(event) => updateField("nome", event.target.value)}
                className="h-[50px] rounded-xl bg-gray-50"
              />
            </Campo>

            <Campo label="Telefone">
              <Input
                value={data.telefone}
                inputMode="numeric"
                onChange={(event) =>
                  updateField("telefone", maskPhone(event.target.value))
                }
                className="h-[50px] rounded-xl bg-gray-50"
              />
            </Campo>

            <Campo label="Cidade">
              <Input
                value={data.cidade}
                onChange={(event) => updateField("cidade", event.target.value)}
                className="h-[50px] rounded-xl bg-gray-50"
              />
            </Campo>

            <Campo label="CEP">
              <Input
                value={data.cep}
                inputMode="numeric"
                onChange={(event) =>
                  updateField("cep", maskCep(event.target.value))
                }
                className="h-[50px] rounded-xl bg-gray-50"
              />
            </Campo>

            <Campo label="Foto de perfil (opcional)">
              <Input
                type="file"
                accept={AVATAR_ACCEPT}
                onChange={handleAvatarChange}
                className="h-[50px] rounded-xl bg-gray-50 pt-3"
              />

              {avatar && (
                <span className="mt-1 block truncate text-xs font-medium text-gray-500">
                  {avatar.name}
                </span>
              )}
            </Campo>
          </>
        )}

        {step === 2 && (
          <Campo label="Categoria">
            <Select
              value={data.categoria}
              onValueChange={(value) => {
                updateField(
                  "categoria",
                  isCategoriaUsuario(value) ? value : ""
                );
              }}
            >
              <SelectTrigger className="h-[50px] w-full rounded-xl bg-gray-50">
                <SelectValue placeholder="Selecione sua categoria" />
              </SelectTrigger>

              <SelectContent>
                {CATEGORIAS_USUARIO.map((categoria) => (
                  <SelectItem key={categoria} value={categoria}>
                    {getCategoriaLabel(categoria)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>
        )}

        {step === 3 && (
          <>
            <Campo label="E-mail">
              <Input
                type="email"
                value={data.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="h-[50px] rounded-xl bg-gray-50"
              />
            </Campo>

            <Campo label="Senha">
              <Input
                type="password"
                value={data.senha}
                onChange={(event) => updateField("senha", event.target.value)}
                className="h-[50px] rounded-xl bg-gray-50"
              />
            </Campo>
          </>
        )}

        <div
          className={`mt-2 grid gap-3 ${
            step > 1 ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={previousStep}
              className="h-[50px] rounded-xl border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            >
              Voltar
            </Button>
          )}

          {step < 3 ? (
            <Button
              type="button"
              onClick={nextStep}
              className="h-[50px] rounded-xl bg-gray-900 text-white hover:bg-black"
            >
              Próximo
            </Button>
          ) : (
            <Button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="h-[50px] rounded-xl bg-gray-900 text-white hover:bg-black disabled:opacity-60"
            >
              {loading ? "Criando..." : "Criar conta"}
            </Button>
          )}
        </div>
      </div>

      <p className="mt-7 text-center text-[13px] text-gray-400">
        Já tem uma conta?{" "}
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="font-semibold text-gray-700 hover:underline"
        >
          Entrar
        </button>
      </p>
    </AuthCard>
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
      <span className="mb-1.5 block text-xs font-semibold text-gray-700">
        {label}
      </span>

      {children}
    </label>
  );
}
