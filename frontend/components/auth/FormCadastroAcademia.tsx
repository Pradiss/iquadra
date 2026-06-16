"use client";

import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";

import AuthCard from "./AuthCard";
import { maskCep, maskPhone, onlyNumbers } from "@/lib/masks";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/services/api";

type AcademiaData = {
  nomeDono: string;
  telefone: string;
  email: string;
  senha: string;
  nomeAcademia: string;
  slug: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
};

const initialData: AcademiaData = {
  nomeDono: "",
  telefone: "",
  email: "",
  senha: "",
  nomeAcademia: "",
  slug: "",
  cnpj: "",
  endereco: "",
  cidade: "",
  estado: "",
  cep: "",
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function cleanPayload(data: AcademiaData) {
  return {
    nome_dono: data.nomeDono.trim(),
    telefone: onlyNumbers(data.telefone),

    nome_academia: data.nomeAcademia.trim(),
    slug: data.slug.trim() || slugify(data.nomeAcademia),
    cnpj: onlyNumbers(data.cnpj) || undefined,
    endereco: data.endereco.trim() || undefined,
    cidade: data.cidade.trim() || undefined,
    estado: data.estado.trim().toUpperCase() || undefined,
    cep: onlyNumbers(data.cep) || undefined,

    email: data.email.trim().toLowerCase(),
    senha: data.senha,
  };
}

export default function FormCadastroAcademia() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AcademiaData>(initialData);

  function updateField<K extends keyof AcademiaData>(
    field: K,
    value: AcademiaData[K]
  ) {
    setData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function validateStep() {
    if (step === 1) {
      if (data.nomeDono.trim().length < 3)
        return "Informe o nome do responsável.";

      if (onlyNumbers(data.telefone).length < 10)
        return "Informe um telefone válido.";
    }

    if (step === 2) {
      if (data.nomeAcademia.trim().length < 3)
        return "Informe o nome da academia.";

      if (data.slug.trim().length < 3)
        return "Informe um slug válido.";

      if (data.cnpj && onlyNumbers(data.cnpj).length !== 14)
        return "Informe um CNPJ válido.";

      if (data.cidade.trim().length < 2) return "Informe a cidade.";

      if (data.estado.trim().length !== 2)
        return "Informe o estado com 2 letras. Ex: SP";

      if (data.cep && onlyNumbers(data.cep).length !== 8)
        return "Informe um CEP válido.";
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
      await api.post("/auth/register/empresa", cleanPayload(data));

      router.push("/login?created=academia");
    } catch (error) {
      if (axios.isAxiosError<{ message?: string }>(error)) {
        setErro(
          error.response?.data?.message ||
            "Não foi possível cadastrar a academia."
        );
      } else {
        setErro("Não foi possível cadastrar a academia.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Cadastro de academia" description={`Etapa ${step} de 3`}>
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
            <Campo label="Nome do responsável">
              <Input
                value={data.nomeDono}
                onChange={(event) =>
                  updateField("nomeDono", event.target.value)
                }
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
          </>
        )}

        {step === 2 && (
          <>
            <Campo label="Nome da academia">
              <Input
                value={data.nomeAcademia}
                onChange={(event) => {
                  const value = event.target.value;

                  updateField("nomeAcademia", value);
                  updateField("slug", slugify(value));
                }}
                className="h-[50px] rounded-xl bg-gray-50"
              />
            </Campo>

            <Campo label="Slug">
              <Input
                value={data.slug}
                onChange={(event) =>
                  updateField("slug", slugify(event.target.value))
                }
                className="h-[50px] rounded-xl bg-gray-50"
              />
            </Campo>

            <Campo label="CNPJ">
              <Input
                value={data.cnpj}
                inputMode="numeric"
                onChange={(event) =>
                  updateField("cnpj", onlyNumbers(event.target.value))
                }
                className="h-[50px] rounded-xl bg-gray-50"
              />
            </Campo>

            <Campo label="Endereço">
              <Input
                value={data.endereco}
                onChange={(event) =>
                  updateField("endereco", event.target.value)
                }
                className="h-[50px] rounded-xl bg-gray-50"
              />
            </Campo>

            <Campo label="Cidade">
              <Input
                value={data.cidade}
                onChange={(event) =>
                  updateField("cidade", event.target.value)
                }
                className="h-[50px] rounded-xl bg-gray-50"
              />
            </Campo>

            <Campo label="Estado">
              <Input
                value={data.estado}
                maxLength={2}
                onChange={(event) =>
                  updateField("estado", event.target.value.toUpperCase())
                }
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
          </>
        )}

        {step === 3 && (
          <>
            <Campo label="E-mail">
              <Input
                type="email"
                value={data.email}
                onChange={(event) =>
                  updateField("email", event.target.value)
                }
                className="h-[50px] rounded-xl bg-gray-50"
              />
            </Campo>

            <Campo label="Senha">
              <Input
                type="password"
                value={data.senha}
                onChange={(event) =>
                  updateField("senha", event.target.value)
                }
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
              {loading ? "Cadastrando..." : "Cadastrar academia"}
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