"use client"

import axios from "axios"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { registerEmpresa } from "@/shared/services/auth.service"
import { maskCep, maskPhone, onlyNumbers } from "@/shared/lib/masks"

type FormData = {
  nomeDono: string
  email: string
  telefone: string
  senha: string
  nomeAcademia: string
  slug: string
  cnpj: string
  endereco: string
  cidade: string
  estado: string
  cep: string
}

const initialData: FormData = {
  nomeDono: "",
  email: "",
  telefone: "",
  senha: "",
  nomeAcademia: "",
  slug: "",
  cnpj: "",
  endereco: "",
  cidade: "",
  estado: "",
  cep: "",
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

export function CadastroEmpresaForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [data, setData] = useState(initialData)
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)

  function updateField(field: keyof FormData, value: string) {
    setData((current) => ({
      ...current,
      [field]: value,
      ...(field === "nomeAcademia" ? { slug: slugify(value) } : {}),
    }))
  }

  function validateStep() {
    if (step === 1) {
      if (data.nomeDono.trim().length < 3) return "Informe seu nome."
      if (!data.email.includes("@")) return "Informe um e-mail valido."
      if (onlyNumbers(data.telefone).length < 10) return "Informe um telefone valido."
      if (data.senha.length < 6) return "A senha precisa ter pelo menos 6 caracteres."
    }

    if (step === 2) {
      if (data.nomeAcademia.trim().length < 3) return "Informe o nome da academia."
      if (data.slug.trim().length < 3) return "Informe um slug valido."
      if (data.cidade.trim().length < 2) return "Informe a cidade."
      if (data.estado.trim().length < 2) return "Informe o estado."
      if (data.cep && onlyNumbers(data.cep).length !== 8) return "Informe um CEP valido."
    }

    return ""
  }

  function nextStep() {
    const error = validateStep()

    if (error) {
      setErro(error)
      return
    }

    setErro("")
    setStep(2)
  }

  async function handleSubmit() {
    const error = validateStep()

    if (error) {
      setErro(error)
      return
    }

    setErro("")
    setLoading(true)

    try {
      await registerEmpresa({
        nome_dono: data.nomeDono.trim(),
        email: data.email.trim().toLowerCase(),
        telefone: onlyNumbers(data.telefone),
        senha: data.senha,
        nome_academia: data.nomeAcademia.trim(),
        slug: data.slug.trim(),
        cnpj: onlyNumbers(data.cnpj) || undefined,
        endereco: data.endereco.trim() || undefined,
        cidade: data.cidade.trim() || undefined,
        estado: data.estado.trim().toUpperCase() || undefined,
        cep: onlyNumbers(data.cep) || undefined,
      })

      router.push("/login?created=academia")
    } catch (error) {
      if (axios.isAxiosError<{ message?: string }>(error)) {
        setErro(
          error.response?.data?.message ?? "Nao foi possivel cadastrar a academia."
        )
      } else {
        setErro("Nao foi possivel cadastrar a academia.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[460px] rounded-2xl bg-white px-5 py-8 shadow-2xl sm:px-8 sm:py-10">
      <div className="mb-6 text-center">
        <Image
          src="/logo.png"
          alt="IQuadra"
          width={124}
          height={32}
          className="mx-auto mb-4 h-8 w-auto"
        />

        <h1 className="text-[28px] font-semibold text-gray-900">
          Cadastrar academia
        </h1>

        <p className="mt-1 text-sm text-gray-400">Etapa {step} de 2</p>
      </div>

      <div className="mb-6 flex gap-1.5">
        {[1, 2].map((item) => (
          <div
            key={item}
            className={`h-[3px] flex-1 rounded-full ${
              item <= step ? "bg-gray-900" : "bg-black/10"
            }`}
          />
        ))}
      </div>

      {erro && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {erro}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {step === 1 && (
          <>
            <Input
              label="Nome do responsavel"
              value={data.nomeDono}
              onChange={(value) => updateField("nomeDono", value)}
            />

            <Input
              label="E-mail"
              type="email"
              value={data.email}
              onChange={(value) => updateField("email", value)}
            />

            <Input
              label="Telefone"
              value={data.telefone}
              onChange={(value) => updateField("telefone", maskPhone(value))}
            />

            <Input
              label="Senha"
              type="password"
              value={data.senha}
              onChange={(value) => updateField("senha", value)}
            />
          </>
        )}

        {step === 2 && (
          <>
            <Input
              label="Nome da academia"
              value={data.nomeAcademia}
              onChange={(value) => updateField("nomeAcademia", value)}
            />

            <Input
              label="Slug"
              value={data.slug}
              onChange={(value) => updateField("slug", slugify(value))}
            />

            <Input
              label="CNPJ"
              value={data.cnpj}
              onChange={(value) => updateField("cnpj", onlyNumbers(value))}
            />

            <Input
              label="Endereco"
              value={data.endereco}
              onChange={(value) => updateField("endereco", value)}
            />

            <Input
              label="Cidade"
              value={data.cidade}
              onChange={(value) => updateField("cidade", value)}
            />

            <Input
              label="Estado"
              value={data.estado}
              onChange={(value) =>
                updateField("estado", value.toUpperCase().slice(0, 2))
              }
            />

            <Input
              label="CEP"
              value={data.cep}
              onChange={(value) => updateField("cep", maskCep(value))}
            />
          </>
        )}

        <div className="mt-2 flex gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="h-[50px] w-full rounded-xl border border-black/10 font-semibold text-gray-700"
            >
              Voltar
            </button>
          )}

          {step === 1 ? (
            <button
              type="button"
              onClick={nextStep}
              className="h-[50px] w-full rounded-xl bg-gray-900 font-semibold text-white"
            >
              Proximo
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="h-[50px] w-full rounded-xl bg-gray-900 font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Cadastrando..." : "Cadastrar academia"}
            </button>
          )}
        </div>
      </div>
      
       <p className="mt-6 text-center text-[13px] text-gray-400 sm:mt-7">
        Ja tem uma conta?{" "}
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="font-semibold text-gray-700 hover:underline"
        >
          Entrar
        </button>
      </p>
    </div>
  )
}

type InputProps = {
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
}

function Input({ label, type = "text", value, onChange }: InputProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-gray-700">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[50px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-[15px] text-gray-900 outline-none focus:border-green-600 focus:bg-white"
      />
    </label>
  )
}
