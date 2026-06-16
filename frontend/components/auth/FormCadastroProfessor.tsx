"use client";

import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";

import AuthCard from "./AuthCard";
import { maskPhone, onlyNumbers } from "@/lib/masks";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import api from "@/services/api";

type ProfessorData = {
  nome: string;
  telefone: string;
  cidade: string;
  bio: string;
  especialidades: string;
  email: string;
  senha: string;
};

const initialData: ProfessorData = {
  nome: "",
  telefone: "",
  cidade: "",
  bio: "",
  especialidades: "",
  email: "",
  senha: "",
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function cleanPayload(data: ProfessorData) {
  return {
    nome: data.nome.trim(),
    email: data.email.trim().toLowerCase(),
    telefone: onlyNumbers(data.telefone),
    senha: data.senha,
    cidade: data.cidade.trim() || undefined,
    bio: data.bio.trim() || undefined,
    especialidades: data.especialidades.trim() || undefined,
  };
}

export default function FormCadastroProfessor() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ProfessorData>(initialData);

  function updateField<K extends keyof ProfessorData>(
    field: K,
    value: ProfessorData[K]
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
    }

    if (step === 2) {
      if (data.bio.trim().length < 10)
        return "Escreva uma bio com pelo menos 10 caracteres.";
      if (data.especialidades.trim().length < 3)
        return "Informe suas especialidades.";
    }

    if (step === 3) {
      if (!isValidEmail(data.email)) return "Informe um e-mail válido.";
      if (data.senha.length < 6)
        return "A senha precisa ter pelo menos 6 caracteres.";
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

  async function handleSubmit() {
    const error = validateStep();

    if (error) {
      setErro(error);
      return;
    }

    setErro("");
    setLoading(true);

    try {
      await api.post("/auth/register/professor", cleanPayload(data));

      router.push("/login?created=professor");
    } catch (error) {
      if (axios.isAxiosError<{ message?: string }>(error)) {
        setErro(
          error.response?.data?.message ||
            "Não foi possível criar o cadastro de professor."
        );
      } else {
        setErro("Não foi possível criar o cadastro de professor.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Cadastro de professor"
      description={`Etapa ${step} de 3`}
    >
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
          </>
        )}

        {step === 2 && (
          <>
            <Campo label="Bio">
              <Textarea
                value={data.bio}
                onChange={(event) => updateField("bio", event.target.value)}
                className="min-h-[100px] rounded-xl bg-gray-50"
              />
            </Campo>

            <Campo label="Especialidades">
              <Input
                value={data.especialidades}
                placeholder="Ex: Tênis infantil, iniciantes, aulas em dupla"
                onChange={(event) =>
                  updateField("especialidades", event.target.value)
                }
                className="h-[50px] rounded-xl bg-gray-50"
              />
            </Campo>
          </>
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
              {loading ? "Criando..." : "Criar cadastro"}
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